package routes

import (
	"anonchihaya.co.uk/handlers"
	"anonchihaya.co.uk/repositories"
	"github.com/gin-gonic/gin"
)

var prefix string = "/api"

func InitRoutes(r *gin.Engine,
	profile_repo repositories.ProfileRepository,
) {

	// * Home
	r.GET(prefix+"/home", handlers.GetHomeMsg)
	r.POST(prefix+"/home"+"/upload-profile-img", handlers.PostProfileImg)
	r.GET(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		handlers.GetProfileInfo(ctx, profile_repo)
	})
	r.DELETE(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		handlers.DeleteProfileInfo(ctx, profile_repo)
	})
	r.POST(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		handlers.PostProfileInfo(ctx, profile_repo)
	})
	r.PUT(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		handlers.PutProfileInfo(ctx, profile_repo)
	})
}
