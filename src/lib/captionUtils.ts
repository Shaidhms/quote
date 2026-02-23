import React from "react";

/**
 * Strip **bold** markdown markers from text.
 * LinkedIn doesn't render markdown, so copy should be clean.
 */
export function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/**
 * Render text with **bold** markers as React elements with <strong>.
 * Preserves whitespace/newlines via the parent's whitespace-pre-line.
 */
export function renderCaptionText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.+?)\*\*$/);
    if (boldMatch) {
      return React.createElement("strong", { key: i, className: "font-bold" }, boldMatch[1]);
    }
    return part;
  });
}
