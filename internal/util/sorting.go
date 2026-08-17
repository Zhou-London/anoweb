package util

import "strings"

// SortField maps a public ?sort= value onto a real column, plus the direction
// used when the caller omits ?order= — names read A-Z, timestamps read
// newest-first.
type SortField struct {
	Column     string
	DefaultDir string // "ASC" or "DESC"
}

// OrderClause resolves ?sort= / ?order= into an ORDER BY clause.
//
// The result is interpolated straight into SQL, so nothing outside `allowed`
// is ever echoed back: an unknown sort key falls back to `fallback`, and the
// direction is narrowed to ASC or DESC. `tiebreak` is always appended — two
// rows sharing a name or an updated_at would otherwise be free to swap places
// between page requests and get duplicated or skipped.
func OrderClause(sort, order string, allowed map[string]SortField, fallback, tiebreak string) string {
	clause := fallback
	if f, ok := allowed[strings.ToLower(strings.TrimSpace(sort))]; ok {
		dir := f.DefaultDir
		switch strings.ToLower(strings.TrimSpace(order)) {
		case "asc":
			dir = "ASC"
		case "desc":
			dir = "DESC"
		}
		clause = f.Column + " " + dir
	}
	if tiebreak != "" {
		clause += ", " + tiebreak
	}
	return clause
}
