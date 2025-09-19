package routes

import (
	adminhandler "anonchihaya.co.uk/handlers/admin_handler"
	experiencehandler "anonchihaya.co.uk/handlers/experience_handler"
	homehandler "anonchihaya.co.uk/handlers/home_handler"
	"anonchihaya.co.uk/middlewares"
	"anonchihaya.co.uk/repositories"
	"github.com/gin-gonic/gin"
)

var prefix string = "/api"

func InitRoutes(r *gin.Engine,
	domain string,
	admin_pass string,
	key string,
	img_path string,
	img_url_prefix string,
	profile_repo repositories.ProfileRepository,
	experiences_repo repositories.ExperienceRepository,
	educations_repo repositories.EducationRepository,
) {

	// * Admin
	admin := r.Group(prefix + "/admin")
	{
		admin.POST("", func(ctx *gin.Context) {
			adminhandler.PostAdminCheck(ctx, domain, admin_pass, key)
		})
		admin.GET("/status", func(ctx *gin.Context) {
			adminhandler.GetStatusCheck(ctx, key)
		})
	}

	// * Home
	home := r.Group(prefix + "/home")
	home.Use(middlewares.KeyChecker(key))
	{
		home.GET("", homehandler.GetHomeMsg)
		home.POST("/upload-profile-img", func(ctx *gin.Context) {
			homehandler.UploadProfileImg(ctx, img_path, img_url_prefix)
		})
		home.GET("/profile-info", func(ctx *gin.Context) {
			homehandler.GetProfileInfo(ctx, profile_repo)
		})
		home.DELETE("/profile-info", func(ctx *gin.Context) {
			homehandler.DeleteProfileInfo(ctx, profile_repo)
		})
		home.POST("/profile-info", func(ctx *gin.Context) {
			homehandler.PostProfileInfo(ctx, profile_repo)
		})
		home.PUT("/profile-info", func(ctx *gin.Context) {
			homehandler.PutProfileInfo(ctx, profile_repo)
		})

		home.GET("/experience", func(ctx *gin.Context) {
			homehandler.GetExperiencesShort(ctx, experiences_repo)
		})

		home.PUT("/experience/order", func(ctx *gin.Context) {
			homehandler.PutExperienceOrder(ctx, experiences_repo)
		})

		home.POST("/upload-education-img", func(ctx *gin.Context) {
			homehandler.UploadEducationImg(ctx, img_path, img_url_prefix)
		})
		home.GET("/education", func(ctx *gin.Context) {
			homehandler.GetEducations(ctx, educations_repo)
		})
		home.DELETE("/education/:id", func(ctx *gin.Context) {
			homehandler.DeleteEducation(ctx, educations_repo)
		})
		home.POST("/education", func(ctx *gin.Context) {
			homehandler.PostEducation(ctx, educations_repo)
		})
		home.POST("/education/image", func(ctx *gin.Context) {
			homehandler.PostEducationImg(ctx, educations_repo)
		})
		home.PUT("/education", func(ctx *gin.Context) {
			homehandler.PutEducation(ctx, educations_repo)
		})
	}

	// * Experience
	exp := r.Group(prefix + "/experience")
	exp.Use(middlewares.KeyChecker(key))
	{
		exp.POST("/upload-experience-img", func(ctx *gin.Context) {
			experiencehandler.UploadExperienceImg(ctx, img_path, img_url_prefix)
		})
		exp.GET("", func(ctx *gin.Context) {
			experiencehandler.GetAllExperiences(ctx, experiences_repo)
		})
		exp.GET("/:id", func(ctx *gin.Context) {
			experiencehandler.GetExperienceByID(ctx, experiences_repo)
		})
		exp.POST("", func(ctx *gin.Context) {
			experiencehandler.PostExperience(ctx, experiences_repo)
		})
		exp.PUT("", func(ctx *gin.Context) {
			experiencehandler.PutExperience(ctx, experiences_repo)
		})
		exp.DELETE("/:id", func(ctx *gin.Context) {
			experiencehandler.DeleteExperience(ctx, experiences_repo)
		})
	}

}
