package util

// Content formats a post or blog body may declare. Markdown is stored as
// written (the frontend renderer escapes any embedded HTML). HTML is stored
// raw and rendered as-is — it can only be written by admins (uploaded as a
// file, never hand-typed), so no sanitizer runs on it.
const (
	FormatMarkdown = "markdown"
	FormatHTML     = "html"
)

// MaxHTMLBytes caps an uploaded HTML document at 1MB. HTML bodies are limited
// by file size; markdown keeps the per-feature character limits.
const MaxHTMLBytes = 1 << 20

// ValidFormat reports whether v names a known content format.
func ValidFormat(v string) bool {
	return v == FormatMarkdown || v == FormatHTML
}
