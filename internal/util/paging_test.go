package util

import "testing"

func TestParsePage(t *testing.T) {
	tests := []struct {
		name       string
		page, size string
		wantOK     bool
		wantNum    int
		wantSize   int
	}{
		{"no page means unpaginated", "", "", false, 0, 0},
		{"page_size alone is still unpaginated", "", "25", false, 0, 0},
		{"page defaults the size", "1", "", true, 1, DefaultPageSize},
		{"explicit size", "3", "25", true, 3, 25},
		{"size is capped", "1", "5000", true, 1, MaxPageSize},
		{"zero size falls back to default", "2", "0", true, 2, DefaultPageSize},
		{"negative size falls back to default", "2", "-4", true, 2, DefaultPageSize},
		{"junk size falls back to default", "2", "ten", true, 2, DefaultPageSize},
		{"page zero is not a page", "0", "10", false, 0, 0},
		{"negative page is not a page", "-1", "10", false, 0, 0},
		{"junk page is not a page", "abc", "10", false, 0, 0},
		{"surrounding space is tolerated", " 2 ", " 5 ", true, 2, 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := ParsePage(tt.page, tt.size)
			if ok != tt.wantOK {
				t.Fatalf("ParsePage(%q, %q) ok = %v, want %v", tt.page, tt.size, ok, tt.wantOK)
			}
			if !ok {
				return
			}
			if got.Number != tt.wantNum || got.Size != tt.wantSize {
				t.Errorf("ParsePage(%q, %q) = %+v, want {Number:%d Size:%d}",
					tt.page, tt.size, got, tt.wantNum, tt.wantSize)
			}
		})
	}
}

func TestPageLimitOffset(t *testing.T) {
	tests := []struct {
		page       Page
		wantOffset int
	}{
		{Page{Number: 1, Size: 10}, 0},
		{Page{Number: 2, Size: 10}, 10},
		{Page{Number: 5, Size: 3}, 12},
	}
	for _, tt := range tests {
		if got := tt.page.Offset(); got != tt.wantOffset {
			t.Errorf("%+v.Offset() = %d, want %d", tt.page, got, tt.wantOffset)
		}
		if got := tt.page.Limit(); got != tt.page.Size {
			t.Errorf("%+v.Limit() = %d, want %d", tt.page, got, tt.page.Size)
		}
	}
}

func TestNewPagedResponseTotalPages(t *testing.T) {
	tests := []struct {
		total, size, want int
	}{
		{0, 10, 0},
		{1, 10, 1},
		{10, 10, 1},
		{11, 10, 2},
		{25, 10, 3},
	}
	for _, tt := range tests {
		got := NewPagedResponse([]int{}, tt.total, Page{Number: 1, Size: tt.size})
		if got.TotalPages != tt.want {
			t.Errorf("total=%d size=%d → TotalPages=%d, want %d",
				tt.total, tt.size, got.TotalPages, tt.want)
		}
	}
}
