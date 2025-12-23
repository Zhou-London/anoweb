package routes

import (
	"anonchihaya.co.uk/handlers"
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
	projects_repo repositories.ProjectRepository,
	posts_repo repositories.PostRepository,
) {

	// * Admin
	admin := r.Group(prefix + "/admin")
	{
		admin.POST("", func(ctx *gin.Context) {
			handlers.PostAdminCheck(ctx, domain, admin_pass, key)
		})
		admin.GET("/status", func(ctx *gin.Context) {
			handlers.GetStatusCheck(ctx, key)
		})
	}

	// * Static File
	static := r.Group(prefix + "/static")
	static.Use(middlewares.KeyChecker(key))
	{
		static.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadImage(ctx, img_path, img_url_prefix)
		})
	}

	// * Home
	home := r.Group(prefix + "/home")
	home.Use(middlewares.KeyChecker(key))
	{
		home.GET("", handlers.GetHomeMsg)
	}

	// * Profile
	profile := r.Group(prefix + "/profile")
	profile.Use(middlewares.KeyChecker(key))
	{
		profile.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadProfileImg(ctx, img_path, img_url_prefix)
		})
		profile.GET("", func(ctx *gin.Context) {
			handlers.GetProfileInfo(ctx, profile_repo)
		})
		profile.DELETE("", func(ctx *gin.Context) {
			handlers.DeleteProfileInfo(ctx, profile_repo)
		})
		profile.POST("", func(ctx *gin.Context) {
			handlers.PostProfileInfo(ctx, profile_repo)
		})
		profile.PUT("", func(ctx *gin.Context) {
			handlers.PutProfileInfo(ctx, profile_repo)
		})
	}

	// * Experience
	exp := r.Group(prefix + "/experience")
	exp.Use(middlewares.KeyChecker(key))
	{
		exp.POST("/upload-experience-img", func(ctx *gin.Context) {
			handlers.UploadExperienceImg(ctx, img_path, img_url_prefix)
		})
		exp.GET("", func(ctx *gin.Context) {
			handlers.GetAllExperiences(ctx, experiences_repo)
		})
		exp.GET("/short", func(ctx *gin.Context) {
			handlers.GetExperiencesShort(ctx, experiences_repo)
		})
		exp.GET("/:id", func(ctx *gin.Context) {
			handlers.GetExperienceByID(ctx, experiences_repo)
		})
		exp.PUT("/order", func(ctx *gin.Context) {
			handlers.PutExperienceOrder(ctx, experiences_repo)
		})
		exp.POST("", func(ctx *gin.Context) {
			handlers.PostExperience(ctx, experiences_repo)
		})
		exp.PUT("", func(ctx *gin.Context) {
			handlers.PutExperience(ctx, experiences_repo)
		})
		exp.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteExperience(ctx, experiences_repo)
		})
	}

	// * Projects
	proj := r.Group(prefix + "/project")
	proj.Use(middlewares.KeyChecker(key))
	{
		proj.GET("", func(ctx *gin.Context) {
			handlers.GetProjects(ctx, projects_repo)
		})
		proj.POST("", func(ctx *gin.Context) {
			handlers.PostProject(ctx, projects_repo)
		})
		proj.POST("/update-image-url", func(ctx *gin.Context) {
			handlers.PostProjectImg(ctx, projects_repo)
		})
		proj.PUT("", func(ctx *gin.Context) {
			handlers.PutProject(ctx, projects_repo)
		})
		proj.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteProject(ctx, projects_repo)
		})
	}

	// * Education
	education := r.Group(prefix + "/education")
	education.Use(middlewares.KeyChecker(key))
	{
		education.POST("/upload-image", func(ctx *gin.Context) {
			handlers.UploadEducationImg(ctx, img_path, img_url_prefix)
		})
		education.GET("", func(ctx *gin.Context) {
			handlers.GetEducations(ctx, educations_repo)
		})
		education.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeleteEducation(ctx, educations_repo)
		})
		education.POST("", func(ctx *gin.Context) {
			handlers.PostEducation(ctx, educations_repo)
		})
		education.POST("/image", func(ctx *gin.Context) {
			handlers.PostEducationImg(ctx, educations_repo)
		})
		education.PUT("", func(ctx *gin.Context) {
			handlers.PutEducation(ctx, educations_repo)
		})
	}

	// * Post
	post := r.Group(prefix + "/post")
	post.Use(middlewares.KeyChecker(key))
	{
		post.GET("/latest", func(ctx *gin.Context) {
			handlers.GetPostLatest(ctx, posts_repo)
		})
		post.GET("/project/:id", func(ctx *gin.Context) {
			handlers.GetPostsShort(ctx, posts_repo)
		})
		post.GET("/:id", func(ctx *gin.Context) {
			handlers.GetPost(ctx, posts_repo)
		})
		post.POST("", func(ctx *gin.Context) {
			handlers.PostPost(ctx, posts_repo)
		})
		post.PUT("", func(ctx *gin.Context) {
			handlers.PutPost(ctx, posts_repo)
		})
		post.DELETE("/:id", func(ctx *gin.Context) {
			handlers.DeletePost(ctx, posts_repo)
		})
	}

}
