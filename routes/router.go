package routes

import (
	experiencehandler "anonchihaya.co.uk/handlers/experience_handler"
	homehandler "anonchihaya.co.uk/handlers/home_handler"
	"anonchihaya.co.uk/repositories"
	"github.com/gin-gonic/gin"
)

var prefix string = "/api"

func InitRoutes(r *gin.Engine,
	img_path string,
	img_url_prefix string,
	profile_repo repositories.ProfileRepository,
	experiences_repo repositories.ExperienceRepository,
	educations_repo repositories.EducationRepository,
) {

	// * Home Profile
	r.GET(prefix+"/home", homehandler.GetHomeMsg)
	r.POST(prefix+"/home"+"/upload-profile-img", func(ctx *gin.Context) {
		homehandler.UploadProfileImg(ctx, img_path, img_url_prefix)
	})
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
	r.GET(prefix+"/home"+"/experience", func(ctx *gin.Context) {
		homehandler.GetExperiencesShort(ctx, experiences_repo)
	})
	// * Home Education
	r.POST(prefix+"/home"+"/upload-education-img", func(ctx *gin.Context) {
		homehandler.UploadEducationImg(ctx, img_path, img_url_prefix)
	})
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

	// * Experience
	r.POST(prefix+"/experience"+"/upload-experience-img", func(ctx *gin.Context) {
		experiencehandler.UploadExperienceImg(ctx, img_path, img_url_prefix)
	})
	r.GET(prefix+"/experience", func(ctx *gin.Context) {
		experiencehandler.GetAllExperiences(ctx, experiences_repo)
	})
	r.GET(prefix+"/experience/:id", func(ctx *gin.Context) {
		experiencehandler.GetExperienceByID(ctx, experiences_repo)
	})
	r.POST(prefix+"/experience", func(ctx *gin.Context) {
		experiencehandler.PostExperience(ctx, experiences_repo)
	})
	r.PUT(prefix+"/experience", func(ctx *gin.Context) {
		experiencehandler.PutExperience(ctx, experiences_repo)
	})
	r.DELETE(prefix+"/experience/:id", func(ctx *gin.Context) {
		experiencehandler.DeleteExperience(ctx, experiences_repo)
	})

}
