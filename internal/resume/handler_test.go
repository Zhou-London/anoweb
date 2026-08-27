package resume

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"anonchihaya.co.uk/internal/auth"
	"github.com/gin-gonic/gin"
)

type fakeRepo struct {
	downloads int64
	err       error
}

func (f *fakeRepo) Downloads() (int64, error) { return f.downloads, f.err }

func (f *fakeRepo) IncrementDownloads() (int64, error) {
	if f.err != nil {
		return 0, f.err
	}
	f.downloads++
	return f.downloads, nil
}

// call runs a handler with an optional signed-in fan and decodes the count.
func call(t *testing.T, handler func(*gin.Context, Repository), repo Repository, user *auth.Fan) (int, int64) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/resume/download", nil)
	if user != nil {
		c.Set("user", user)
	}
	handler(c, repo)

	var body struct {
		Downloads int64 `json:"downloads"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode %q: %v", w.Body.String(), err)
	}
	return w.Code, body.Downloads
}

func TestGetDownloads(t *testing.T) {
	code, got := call(t, GetDownloads, &fakeRepo{downloads: 42}, nil)
	if code != http.StatusOK || got != 42 {
		t.Fatalf("got %d %d, want 200 42", code, got)
	}
}

func TestRecordDownloadCountsVisitors(t *testing.T) {
	repo := &fakeRepo{downloads: 4}
	for i, want := range []int64{5, 6} {
		code, got := call(t, RecordDownload, repo, nil)
		if code != http.StatusOK || got != want {
			t.Fatalf("guest click %d: got %d %d, want 200 %d", i+1, code, got, want)
		}
	}
	if _, got := call(t, RecordDownload, repo, &auth.Fan{IsAdmin: false}); got != 7 {
		t.Fatalf("signed-in fan: got %d, want 7", got)
	}
}

func TestRecordDownloadSkipsOwner(t *testing.T) {
	repo := &fakeRepo{downloads: 4}
	code, got := call(t, RecordDownload, repo, &auth.Fan{IsAdmin: true})
	if code != http.StatusOK || got != 4 || repo.downloads != 4 {
		t.Fatalf("owner click: got %d %d (stored %d), want 200 4 (stored 4)", code, got, repo.downloads)
	}
}

func TestRecordDownloadReportsErrors(t *testing.T) {
	code, _ := call(t, RecordDownload, &fakeRepo{err: errors.New("db down")}, nil)
	if code != http.StatusInternalServerError {
		t.Fatalf("got %d, want 500", code)
	}
}
