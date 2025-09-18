package adminhandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func PostAdminCheck(c *gin.Context, domain string, admin_pass string, key string) {
	pass := c.PostForm("pass")
	if pass == admin_pass {
		c.SetCookie("key", key, 86400, "/", domain, false, true)
		c.JSON(http.StatusOK, gin.H{"message": "Validated"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid password"})
	}
}

func GetStatusCheck(c *gin.Context, expectedKey string) {
	key, err := c.Cookie("key")
	if err != nil || key != expectedKey {
		c.JSON(http.StatusUnauthorized, gin.H{"isAdmin": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"isAdmin": true})
}
