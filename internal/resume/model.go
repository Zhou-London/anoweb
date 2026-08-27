package resume

// StatsID pins the one row of resume_stats; the counter has no natural key.
const StatsID = 1

// Stats keeps the CV's download counter. The row is created by the first
// download, so a fresh database reads as zero without any seeding step.
type Stats struct {
	ID        int   `gorm:"primaryKey" json:"-"`
	Downloads int64 `gorm:"default:0" json:"downloads"`
}

func (Stats) TableName() string {
	return "resume_stats"
}
