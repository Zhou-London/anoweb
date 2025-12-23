package routes

import (
	"anonchihaya.co.uk/src/handlers"
	"anonchihaya.co.uk/src/middlewares"
	"github.com/gin-gonic/gin"
)

func registerHomeRoutes(r *gin.Engine, key string) {
	home := r.Group(prefix + "/home")
	home.Use(middlewares.KeyChecker(key))
	{
		home.GET("", handlers.GetHomeMsg)
	}
}
