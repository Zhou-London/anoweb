package vbook

import (
	"testing"
	"time"
)

func TestAggregateProgress_GroupsByChapter(t *testing.T) {
	now := time.Now()
	rows := []*VBookProgress{
		{ChapterID: "ch1", SectionID: "intro", CreatedAt: now.Add(-2 * time.Hour)},
		{ChapterID: "ch1", SectionID: "questions", CreatedAt: now.Add(-1 * time.Hour)},
		{ChapterID: "ch2", SectionID: "intro", CreatedAt: now},
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

func TestAggregateProgress_LastCompletedAt(t *testing.T) {
	early := time.Date(2025, 1, 1, 10, 0, 0, 0, time.UTC)
	late := time.Date(2025, 1, 5, 14, 0, 0, 0, time.UTC)
	rows := []*VBookProgress{
		{ChapterID: "ch1", SectionID: "intro", CreatedAt: early},
		{ChapterID: "ch1", SectionID: "quiz", CreatedAt: late},
	}

	got := aggregateProgress(rows)

	if len(got) != 1 {
		t.Fatalf("expected 1 chapter, got %d", len(got))
	}
	if got[0].LastCompletedAt == nil {
		t.Fatal("expected LastCompletedAt to be set")
	}
	if !got[0].LastCompletedAt.Equal(late) {
		t.Errorf("expected LastCompletedAt=%v, got %v", late, *got[0].LastCompletedAt)
	}
}

func TestAggregateProgress_SingleRow(t *testing.T) {
	ts := time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC)
	rows := []*VBookProgress{
		{ChapterID: "ch3", SectionID: "summary", CreatedAt: ts},
	}

	got := aggregateProgress(rows)

	if len(got) != 1 {
		t.Fatalf("expected 1 chapter, got %d", len(got))
	}
	if got[0].CompletedCount != 1 {
		t.Errorf("expected count 1, got %d", got[0].CompletedCount)
	}
	if got[0].LastCompletedAt == nil || !got[0].LastCompletedAt.Equal(ts) {
		t.Errorf("expected LastCompletedAt=%v, got %v", ts, got[0].LastCompletedAt)
	}
}
