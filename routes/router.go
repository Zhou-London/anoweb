package routes

import (
	"anonchihaya.co.uk/handlers"
	"github.com/gin-gonic/gin"
)

var prefix string = "/api"

func InitRoutes(r *gin.Engine) {
	r.GET(prefix+"/home", handlers.GetHomeMsg)
}
