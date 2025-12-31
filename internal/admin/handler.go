package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// PostAdminCheck godoc
// @Summary Validate admin password
// @Tags admin
// @Accept json
// @Produce json
// @Param body body AdminCheckRequest true "Admin password"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} MessageResponse
// @Router /admin [post]
func PostAdminCheck(c *gin.Context, domain string, admin_pass string, key string) {

	type PostAdminCheckRequest struct {
		Pass string `json:"pass"`
	}

	var req PostAdminCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Pass == admin_pass {
		c.SetCookie("key", key, 86400, "/", domain, false, true)
		c.JSON(http.StatusOK, gin.H{"message": "Validated"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid password"})
	}
}

// GetStatusCheck godoc
// @Summary Check admin status
// @Tags admin
// @Produce json
// @Success 200 {object} AdminStatusResponse
// @Failure 401 {object} AdminStatusResponse
// @Router /admin/status [get]
func GetStatusCheck(c *gin.Context, expectedKey string) {
	key, err := c.Cookie("key")
	if err != nil || key != expectedKey {
		c.JSON(http.StatusUnauthorized, gin.H{"isAdmin": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"isAdmin": true})
}

// PostAdminLogout godoc
// @Summary Logout admin (clear key cookie)
// @Tags admin
// @Produce json
// @Success 200 {object} MessageResponse
// @Router /admin/logout [post]
func PostAdminLogout(c *gin.Context, domain string) {
	c.SetCookie("key", "", -1, "/", domain, false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}
