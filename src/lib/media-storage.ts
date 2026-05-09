/**
 * 媒体文件存储封装。
 * - 生产（配置 BLOB_READ_WRITE_TOKEN）优先使用 Vercel Blob；
 * - 本地开发可回退到 public/uploads 本地磁盘存储。
 *
 * 图片上传时自动使用 sharp 压缩为 WebP 格式（GIF 除外），
 * 长边限制 1920px，质量 80，兼顾清晰度与体积。
 */
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { randomBytes } from "crypto"
import sharp from "sharp"
import { put, del } from "@vercel/blob"

const DEFAULT_UPLOAD_SUBDIR = path.join("public", "uploads")

const MAX_DIMENSION = 1920
const WEBP_QUALITY = 80

export type MediaEntityType = "POST" | "WORK_DESIGN" | "WORK_DEVELOPMENT" | "TUTORIAL"

export interface SaveFileResult {
  /** 可直接在 <img src> 中使用的 URL，如 /uploads/POST/abc/xxx.webp */
  url: string
  /** 存储路径 key，如 POST/abc123/xxxx-image.webp */
  key: string
}

function shouldUseVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

function getBlobAccess(): "public" | "private" {
  const raw = process.env.BLOB_ACCESS?.trim().toLowerCase()
  if (raw === "public") return "public"
  return "private"
}

function buildBlobProxyUrl(pathname: string): string {
  return `/api/media/file?path=${encodeURIComponent(pathname)}`
}

function parseBlobPathFromProxyUrl(url: string): string | null {
  try {
    const parsed = new URL(url, "http://localhost")
    if (parsed.pathname !== "/api/media/file") return null
    const blobPath = parsed.searchParams.get("path")?.trim()
    return blobPath || null
  } catch {
    return null
  }
}

function getUploadRootDir(): string {
  const configured = process.env.UPLOAD_ROOT_DIR?.trim()
  if (configured) return path.resolve(configured)
  return path.join(process.cwd(), DEFAULT_UPLOAD_SUBDIR)
}

function getUploadPublicBaseUrl(): string {
  const configured = process.env.UPLOAD_PUBLIC_BASE_URL?.trim()
  const base = configured && configured.length > 0 ? configured : "/uploads"
  return `/${base.replace(/^\/+/, "").replace(/\/+$/, "")}`
}

function buildUploadPathInfo(key: string): { absolutePath: string; url: string } {
  const normalizedKey = key.replace(/\\/g, "/")
  const absolutePath = path.join(getUploadRootDir(), normalizedKey)
  const url = `${getUploadPublicBaseUrl()}/${normalizedKey}`
  return { absolutePath, url }
}

async function saveFileToVercelBlob(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<SaveFileResult> {
  const access = getBlobAccess()
  const blob = await put(key, buffer, {
    access,
    contentType: mimeType,
    addRandomSuffix: false,
  })
  const url = access === "private" ? buildBlobProxyUrl(blob.pathname) : blob.url
  return { url, key: blob.pathname }
}

async function saveFileToLocalDisk(buffer: Buffer, key: string): Promise<SaveFileResult> {
  const { absolutePath, url } = buildUploadPathInfo(key)
  const dir = path.dirname(absolutePath)
  await mkdir(dir, { recursive: true })
  await writeFile(absolutePath, buffer, { flag: "wx" })
  return { url, key }
}

/** 保存文件；优先 Vercel Blob，未配置时回退到本地。 */
export async function saveFile(
  buffer: Buffer,
  entityType: MediaEntityType,
  entityId: string,
  originalName: string,
  mimeType: string
): Promise<SaveFileResult> {
  let finalBuffer = buffer
  let finalExt = getExtension(originalName, mimeType)

  // 图片自动压缩为 WebP（GIF 保留原格式以支持动图）
  if (mimeType.startsWith("image/") && mimeType !== "image/gif") {
    finalBuffer = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
    finalExt = ".webp"
  }

  const safeName = sanitizeFileName(originalName) || "file"
  const nameWithoutExt = safeName.replace(/\.[^.]+$/, "")
  const baseName = `${randomBytes(8).toString("hex")}-${nameWithoutExt}`
  const fileName = `${baseName}${finalExt}`
  const key = `${entityType}/${entityId}/${fileName}`

  if (shouldUseVercelBlob()) {
    return saveFileToVercelBlob(finalBuffer, key, mimeType)
  }

  try {
    return await saveFileToLocalDisk(finalBuffer, key)
  } catch (error) {
    if (
      error instanceof Error &&
      (process.env.VERCEL === "1" ||
        error.message.includes("EROFS") ||
        error.message.includes("read-only file system"))
    ) {
      throw new Error(
        "当前部署环境不支持本地磁盘上传。请在环境变量中配置 BLOB_READ_WRITE_TOKEN 以启用 Vercel Blob。"
      )
    }
    throw error
  }
}

/** 根据 URL 删除上传文件（Blob 或本地磁盘）；失败时静默忽略。 */
export async function deleteFile(url: string): Promise<void> {
  if (!url) return

  if (shouldUseVercelBlob()) {
    try {
      const pathnameFromProxy = parseBlobPathFromProxyUrl(url)
      await del(pathnameFromProxy ?? url)
    } catch {
      // ignore
    }
    return
  }

  const publicBase = getUploadPublicBaseUrl()
  const prefix = `${publicBase}/`
  if (!url.startsWith(prefix)) return
  try {
    const relativePath = url.slice(prefix.length)
    const absolutePath = path.join(getUploadRootDir(), relativePath)
    await unlink(absolutePath)
  } catch {
    // ignore
  }
}

function getExtension(originalName: string, mimeType: string): string {
  const fromName = path.extname(originalName)
  if (fromName) return fromName
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  }
  return mimeToExt[mimeType] ?? ""
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^\w\u4e00-\u9fa5.-]/g, "_")
    .slice(0, 80)
}

export function getMediaTypeFromMime(mime: string): "image" | "video" | "file" {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "file"
}

export const saveFileToLocal = saveFile
