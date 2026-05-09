import { NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

export const dynamic = "force-dynamic"

const ALLOWED_ENTITY_PREFIXES = [
  "POST/",
  "WORK_DESIGN/",
  "WORK_DEVELOPMENT/",
  "TUTORIAL/",
]

function isAllowedBlobPath(pathname: string): boolean {
  return ALLOWED_ENTITY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const blobPath = searchParams.get("path")?.trim()

  if (!blobPath) {
    return NextResponse.json({ error: "缺少 path 参数" }, { status: 400 })
  }

  if (!isAllowedBlobPath(blobPath)) {
    return NextResponse.json({ error: "非法路径" }, { status: 400 })
  }

  try {
    const result =
      (await get(blobPath, { access: "private" })) ??
      (await get(blobPath, { access: "public" }))

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 })
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[GET /api/media/file]", error)
    return NextResponse.json({ error: "读取文件失败" }, { status: 500 })
  }
}
