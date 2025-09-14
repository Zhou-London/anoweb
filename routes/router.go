package routes

import (
	homehandler "anonchihaya.co.uk/handlers/home_handler"
	"anonchihaya.co.uk/repositories"
	"github.com/gin-gonic/gin"
)

var prefix string = "/api"

func InitRoutes(r *gin.Engine,
	profile_repo repositories.ProfileRepository,
	experiences_repo repositories.ExperienceRepository,
	educations_repo repositories.EducationRepository,
) {

	// * Home Profile
	r.GET(prefix+"/home", homehandler.GetHomeMsg)
	r.POST(prefix+"/home"+"/upload-profile-img", homehandler.UploadProfileImg)
	r.GET(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		homehandler.GetProfileInfo(ctx, profile_repo)
	})
	r.DELETE(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		homehandler.DeleteProfileInfo(ctx, profile_repo)
	})
	r.POST(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		homehandler.PostProfileInfo(ctx, profile_repo)
	})
	r.PUT(prefix+"/home"+"/profile-info", func(ctx *gin.Context) {
		homehandler.PutProfileInfo(ctx, profile_repo)
	})
	// * Home Experience
	r.GET(prefix+"/home"+"/experiences", func(ctx *gin.Context) {
		homehandler.GetExperiencesShort(ctx, experiences_repo)
	})
	// * Home Education
	r.POST(prefix+"/home"+"/upload-education-img", homehandler.UploadEducationImg)
	r.GET(prefix+"/home"+"/education", func(ctx *gin.Context) {
		homehandler.GetEducations(ctx, educations_repo)
	})
	r.DELETE(prefix+"/home"+"/education", func(ctx *gin.Context) {
		homehandler.DeleteEducation(ctx, educations_repo)
	})
	r.POST(prefix+"/home"+"/education", func(ctx *gin.Context) {
		homehandler.PostEducation(ctx, educations_repo)
	})
	r.PUT(prefix+"/home"+"/education", func(ctx *gin.Context) {
		homehandler.PutEducation(ctx, educations_repo)
	})
}
