package routes

import (
	_ "anonchihaya.co.uk/docs"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func registerSwaggerRoutes(r *gin.Engine) {
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Caddy only reverse-proxies `/api*`, so expose Swagger under the API prefix as well.
	r.GET(prefix+"/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
