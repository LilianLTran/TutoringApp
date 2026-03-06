function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Replace {{var}} in template strings.
// If isHtml=true, we HTML-escape values by default.

export function renderTemplateString(
  input: string,
  variables: Record<string, any>,
  { isHtml }: { isHtml: boolean }
) {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const raw = variables?.[key];
    const val = raw == null ? "" : String(raw);
    return isHtml ? escapeHtml(val) : val;
  });
}