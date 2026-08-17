package util

import "testing"

var testFields = map[string]SortField{
	"name":    {Column: "posts.name", DefaultDir: "ASC"},
	"updated": {Column: "posts.updated_at", DefaultDir: "DESC"},
}

const (
	testFallback = "posts.updated_at DESC"
	testTiebreak = "posts.id DESC"
)

func TestOrderClause(t *testing.T) {
	tests := []struct {
		name        string
		sort, order string
		want        string
	}{
		{"empty falls back", "", "", testFallback + ", " + testTiebreak},
		{"name defaults to A-Z", "name", "", "posts.name ASC, posts.id DESC"},
		{"name descending", "name", "desc", "posts.name DESC, posts.id DESC"},
		{"updated defaults to newest first", "updated", "", "posts.updated_at DESC, posts.id DESC"},
		{"updated ascending", "updated", "asc", "posts.updated_at ASC, posts.id DESC"},
		{"case is ignored", "NAME", "ASC", "posts.name ASC, posts.id DESC"},
		{"space is trimmed", " name ", " desc ", "posts.name DESC, posts.id DESC"},
		{"unknown field falls back", "views", "asc", testFallback + ", " + testTiebreak},
		{"unknown order keeps the field default", "name", "sideways", "posts.name ASC, posts.id DESC"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OrderClause(tt.sort, tt.order, testFields, testFallback, testTiebreak)
			if got != tt.want {
				t.Errorf("OrderClause(%q, %q) = %q, want %q", tt.sort, tt.order, got, tt.want)
			}
		})
	}
}

// A sort key is interpolated into SQL, so anything off the whitelist — quotes,
// comments, a trailing statement — must never reach the clause.
func TestOrderClauseRejectsInjection(t *testing.T) {
	injections := []string{
		"posts.name; DROP TABLE posts",
		"name) --",
		"(SELECT 1)",
		"name ASC, (SELECT SLEEP(5))",
		"name'",
	}
	for _, bad := range injections {
		got := OrderClause(bad, "asc", testFields, testFallback, testTiebreak)
		if want := testFallback + ", " + testTiebreak; got != want {
			t.Errorf("OrderClause(%q) = %q, want the fallback %q", bad, got, want)
		}
	}
	// The direction is narrowed the same way.
	got := OrderClause("name", "asc; DROP TABLE posts", testFields, testFallback, testTiebreak)
	if want := "posts.name ASC, posts.id DESC"; got != want {
		t.Errorf("injected order = %q, want %q", got, want)
	}
}

func TestOrderClauseWithoutTiebreak(t *testing.T) {
	if got, want := OrderClause("name", "", testFields, testFallback, ""), "posts.name ASC"; got != want {
		t.Errorf("OrderClause with no tiebreak = %q, want %q", got, want)
	}
}
