package blog

import (
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// viewDedupWindow is how long a visitor's view of a blog stays "seen" —
// repeat opens within it don't bump the counter.
const viewDedupWindow = 24 * time.Hour

var viewDedup = struct {
	sync.Mutex
	seen map[string]time.Time
}{seen: make(map[string]time.Time)}

// viewerKey identifies a visitor: the session cookie when present (stable
// across networks for members), otherwise a hash of IP + User-Agent.
func viewerKey(c *gin.Context, blogID int) string {
	id := ""
	if token, err := c.Cookie("session_token"); err == nil && token != "" {
		id = "s:" + token
	} else {
		id = "a:" + c.ClientIP() + "|" + c.Request.UserAgent()
	}
	sum := sha256.Sum256([]byte(id))
	return strconv.Itoa(blogID) + ":" + hex.EncodeToString(sum[:16])
}

// shouldCountView reports whether this visitor's view of the blog is the
// first within the dedup window, recording it if so. State is in-memory;
// a restart resets it, which at worst counts a returning reader once more.
func shouldCountView(c *gin.Context, blogID int) bool {
	key := viewerKey(c, blogID)
	now := time.Now()

	viewDedup.Lock()
	defer viewDedup.Unlock()

	if last, ok := viewDedup.seen[key]; ok && now.Sub(last) < viewDedupWindow {
		return false
	}
	if len(viewDedup.seen) > 4096 {
		for k, t := range viewDedup.seen {
			if now.Sub(t) >= viewDedupWindow {
				delete(viewDedup.seen, k)
			}
		}
	}
	viewDedup.seen[key] = now
	return true
}
