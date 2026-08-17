package util

import (
	"strconv"
	"strings"
)

const (
	// DefaultPageSize is used when ?page= arrives without an explicit
	// ?page_size=. MaxPageSize caps what a caller may ask for.
	DefaultPageSize = 10
	MaxPageSize     = 100
)

// Page is a validated, 1-based page request.
type Page struct {
	Number int
	Size   int
}

// Limit is the SQL LIMIT for the page.
func (p Page) Limit() int { return p.Size }

// Offset is the SQL OFFSET for the page.
func (p Page) Offset() int { return (p.Number - 1) * p.Size }

// ParsePage reads the ?page= / ?page_size= pair off a list request.
//
// ok is false when ?page= is missing or unusable, and that is a deliberate
// part of the contract: list endpoints then answer with the whole collection
// as a bare JSON array, which is what the sitemap, the home page and the admin
// managers consume. Callers that do pass ?page= get a PagedResponse envelope
// instead.
func ParsePage(page, size string) (Page, bool) {
	n, err := strconv.Atoi(strings.TrimSpace(page))
	if err != nil || n < 1 {
		return Page{}, false
	}
	s, err := strconv.Atoi(strings.TrimSpace(size))
	if err != nil || s < 1 {
		s = DefaultPageSize
	}
	if s > MaxPageSize {
		s = MaxPageSize
	}
	return Page{Number: n, Size: s}, true
}

// PagedResponse is the envelope list endpoints return when the caller asked
// for a specific page.
type PagedResponse struct {
	Items      any `json:"items"`
	Total      int `json:"total"`
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalPages int `json:"total_pages"`
}

// NewPagedResponse wraps one page of rows together with the totals the client
// needs to draw a pager. items should be a non-nil slice so an empty page
// serialises as [] rather than null.
func NewPagedResponse(items any, total int, p Page) PagedResponse {
	pages := 0
	if p.Size > 0 {
		pages = (total + p.Size - 1) / p.Size
	}
	return PagedResponse{
		Items:      items,
		Total:      total,
		Page:       p.Number,
		PageSize:   p.Size,
		TotalPages: pages,
	}
}
