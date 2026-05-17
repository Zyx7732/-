import { blockNoteToHtml } from "@/lib/blocknote-to-html"
import type { Block } from "@blocknote/core"
import { isBlockNoteFormat, isTiptapFormat, jsonToPlainText, normalizeEditorContent } from "@/lib/content-format"

/** 将内容转为 HTML（服务端）。支持 BlockNote 与 Tiptap 格式，其它返回 null。 */
export function contentToHtml(content: unknown): string | null {
  const normalized = normalizeEditorContent(content)
  if (!normalized || typeof normalized !== "object") return null

  if (isBlockNoteFormat(normalized)) {
    try {
      return blockNoteToHtml(normalized as Block[])
    } catch (e) {
      console.error("[contentToHtml] BlockNote render error:", e)
      return null
    }
  }

  if (isTiptapFormat(normalized)) {
    const text = jsonToPlainText(normalized)
    if (!text.trim()) return null
    return text
      .split("\n")
      .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
      .join("")
  }

  return null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export { jsonToPlainText }
