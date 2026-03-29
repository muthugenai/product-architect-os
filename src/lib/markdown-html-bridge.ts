import TurndownService from "turndown";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

/** HTML for TipTap; empty markdown → empty paragraph node. */
export function markdownToHtmlForEditor(md: string): string {
  const raw = (md ?? "").trim();
  if (!raw) return "<p></p>";
  const result = marked.parse(raw, { async: false });
  return typeof result === "string" ? result : "<p></p>";
}

/** Persist as markdown for existing render pipeline + git-friendly storage. */
export function htmlToMarkdownForStorage(html: string): string {
  return turndown.turndown(html).trim();
}
