package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"github.com/gin-gonic/gin"
)

func registerStaticRoutes(r *gin.Engine, key, imgPath, imgURLPrefix string) {
	static := r.Group(prefix + "/static")
	static.Use(middlewares.KeyChecker(key))
	{
		static.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadImage(ctx, imgPath, imgURLPrefix)
		})
	}
}
