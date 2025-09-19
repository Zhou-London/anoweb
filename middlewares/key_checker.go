package middlewares

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func KeyChecker(expectedKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodPost ||
			c.Request.Method == http.MethodPut ||
			c.Request.Method == http.MethodDelete {

			var value string

			if v := c.Query("key"); v != "" {
				value = v
			}

			if value == "" {
				if v := c.PostForm("key"); v != "" {
					value = v
				}
			}

			if value == "" {
				if v, err := c.Cookie("key"); err == nil {
					value = v
				}
			}

			if value == "" && c.Request.Body != nil {
				bodyBytes, _ := io.ReadAll(c.Request.Body)
				c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

				var data map[string]interface{}
				if err := json.Unmarshal(bodyBytes, &data); err == nil {
					if v, ok := data["key"]; ok {
						if str, ok := v.(string); ok {
							if str == expectedKey {
								value = str
							}
						}
					}
				}
			}

			if value == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Unauthorized",
				})
				c.Abort()
				return
			}

			c.Set(expectedKey, value)
		}

		c.Next()
	}
}
