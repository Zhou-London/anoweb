// Package cleanup removes uploaded images that are no longer referenced by
// any database record (garbage collection for the shared IMG_PATH directory).
package cleanup

import (
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"anonchihaya.co.uk/internal/announcement"
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/blog"
	"anonchihaya.co.uk/internal/comment"
	"anonchihaya.co.uk/internal/education"
	"anonchihaya.co.uk/internal/experience"
	"anonchihaya.co.uk/internal/learning"
	"anonchihaya.co.uk/internal/post"
	"anonchihaya.co.uk/internal/project"
	"gorm.io/gorm"
)

// sources lists every DB column that can reference an uploaded image, either
// as a bare URL column or embedded in markdown/text. Keep this in sync with
// the models — a missing entry means live images get deleted.
var sources = []struct {
	model any
	cols  []string
}{
	{&blog.Blog{}, []string{"image_url", "content_md"}},
	{&post.Post{}, []string{"content_md"}},
	{&announcement.Announcement{}, []string{"image_url", "content_md"}},
	{&project.Project{}, []string{"image_url"}},
	{&experience.Experience{}, []string{"image_url"}},
	{&education.Education{}, []string{"image_url"}},
	{&learning.Learning{}, []string{"image_url"}},
	{&auth.Fan{}, []string{"profile_photo"}},
	{&comment.Comment{}, []string{"content"}},
}

// deletablePrefixes marks filenames created by the upload handlers. Anything
// else in the directory (e.g. the fixed profile-img.png, which is never
// referenced from the DB) is left alone.
var deletablePrefixes = []string{
	"img-",
	"profile-img-", // fan avatars; the trailing dash excludes profile-img.png
	"experience-img-",
	"education-img-",
}

// Start sweeps once at startup and then every interval. Files younger than
// minAge are never deleted, so images uploaded into a not-yet-saved draft
// survive until the draft is saved.
func Start(db *gorm.DB, imgPath string, interval, minAge time.Duration) {
	go func() {
		for {
			deleted, kept, err := Sweep(db, imgPath, minAge)
			if err != nil {
				log.Printf("image cleanup: aborted: %v", err)
			} else {
				log.Printf("image cleanup: deleted %d unreferenced file(s), kept %d", deleted, kept)
			}
			time.Sleep(interval)
		}
	}()
}

// Sweep deletes upload files not referenced anywhere in the DB and returns
// (deleted, kept) counts. If any reference query fails it aborts without
// deleting anything — an incomplete reference set must never cause deletions.
func Sweep(db *gorm.DB, imgPath string, minAge time.Duration) (int, int, error) {
	var blobs []string
	for _, s := range sources {
		for _, col := range s.cols {
			var vals []string
			if err := db.Model(s.model).Pluck(col, &vals).Error; err != nil {
				return 0, 0, err
			}
			blobs = append(blobs, vals...)
		}
	}
	haystack := strings.Join(blobs, "\n")

	entries, err := os.ReadDir(imgPath)
	if err != nil {
		return 0, 0, err
	}

	now := time.Now()
	deleted, kept := 0, 0
	for _, entry := range entries {
		if entry.IsDir() || !hasDeletablePrefix(entry.Name()) {
			continue
		}
		info, err := entry.Info()
		if err != nil || now.Sub(info.ModTime()) < minAge {
			kept++
			continue
		}
		name := entry.Name()
		// Match both the raw filename and its percent-encoded form, in case a
		// stored URL was encoded by a client.
		if strings.Contains(haystack, name) || strings.Contains(haystack, url.PathEscape(name)) {
			kept++
			continue
		}
		if err := os.Remove(filepath.Join(imgPath, name)); err != nil {
			log.Printf("image cleanup: failed to delete %s: %v", name, err)
			kept++
			continue
		}
		log.Printf("image cleanup: deleted %s", name)
		deleted++
	}
	return deleted, kept, nil
}

func hasDeletablePrefix(name string) bool {
	for _, p := range deletablePrefixes {
		if strings.HasPrefix(name, p) {
			return true
		}
	}
	return false
}
