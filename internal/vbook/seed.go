package vbook

import (
	"errors"

	"gorm.io/gorm"
)

// SeedDefaults inserts the first vBook (Quant Research) once, on first boot.
// Subsequent boots see the existing row and do nothing. Admins can edit the
// row through the API afterwards — seeding never overwrites edited content.
func SeedDefaults(repo VBookRepository) error {
	_, err := repo.GetBySlug("quant-research")
	if err == nil {
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	vb := &VBook{
		Slug:          "quant-research",
		Title:         "Quant Research, Explained Like You're New",
		Description:   "An interactive walk-through of two foundational chapters in quantitative investing. Click through bite-sized sections, play with simulators, and check your understanding with quizzes. No prior math required.",
		CoverImageURL: "",
		OrderIndex:    0,
	}
	_, err = repo.Create(vb)
	return err
}
