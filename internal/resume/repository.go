package resume

import (
	"anonchihaya.co.uk/internal/store"
	"gorm.io/gorm"
)

type Repository interface {
	Downloads() (int64, error)
	IncrementDownloads() (int64, error)
}

// * Resume Repository Implementation (GORM/MySql)
type repository struct {
	db *gorm.DB
}

func NewRepository() Repository {
	return &repository{db: store.DB}
}

// Downloads returns the counter — zero until the first download creates the
// row. Find rather than First: a missing row is the expected state on a fresh
// database, not an error worth a log line per request.
func (r *repository) Downloads() (int64, error) {
	var s Stats
	res := r.db.Where("id = ?", StatsID).Limit(1).Find(&s)
	if res.Error != nil {
		return 0, res.Error
	}
	if res.RowsAffected == 0 {
		return 0, nil
	}
	return s.Downloads, nil
}

// IncrementDownloads adds one and returns the new count. The bump is a single
// `downloads + 1` UPDATE, so concurrent downloads never overwrite each other.
func (r *repository) IncrementDownloads() (int64, error) {
	bump := func() (int64, error) {
		res := r.db.Model(&Stats{}).Where("id = ?", StatsID).
			UpdateColumn("downloads", gorm.Expr("downloads + 1"))
		return res.RowsAffected, res.Error
	}
	n, err := bump()
	if err != nil {
		return 0, err
	}
	if n == 0 {
		// First download ever: seed the row. A concurrent seed loses on the
		// primary key, and by then the plain increment succeeds.
		if err := r.db.Create(&Stats{ID: StatsID, Downloads: 1}).Error; err == nil {
			return 1, nil
		}
		if _, err := bump(); err != nil {
			return 0, err
		}
	}
	return r.Downloads()
}
