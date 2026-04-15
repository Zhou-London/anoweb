package vbook

import "testing"

func TestAggregateProgress_GroupsByChapter(t *testing.T) {
	rows := []*VBookProgress{
		{ChapterID: "ch1", SectionID: "intro"},
		{ChapterID: "ch1", SectionID: "questions"},
		{ChapterID: "ch2", SectionID: "intro"},
	}

	got := aggregateProgress(rows)

	if len(got) != 2 {
		t.Fatalf("expected 2 chapter groups, got %d", len(got))
	}
	if got[0].ChapterID != "ch1" || got[0].CompletedCount != 2 {
		t.Errorf("expected ch1=2, got %+v", got[0])
	}
	if got[1].ChapterID != "ch2" || got[1].CompletedCount != 1 {
		t.Errorf("expected ch2=1, got %+v", got[1])
	}
	if len(got[0].CompletedSection) != 2 {
		t.Errorf("expected ch1 to have 2 sections, got %v", got[0].CompletedSection)
	}
}

func TestAggregateProgress_EmptyInput(t *testing.T) {
	got := aggregateProgress(nil)
	if len(got) != 0 {
		t.Errorf("expected empty slice, got %d entries", len(got))
	}
}
