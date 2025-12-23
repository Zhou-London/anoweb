package routes

import (
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

const prefix string = "/api"

func InitRoutes(
	r *gin.Engine,
	domain string,
	adminPass string,
	key string,
	imgPath string,
	imgURLPrefix string,
	profileRepo repositories.ProfileRepository,
	experiencesRepo repositories.ExperienceRepository,
	educationsRepo repositories.EducationRepository,
	projectsRepo repositories.ProjectRepository,
	postsRepo repositories.PostRepository,
) {
	registerAdminRoutes(r, domain, adminPass, key)
	registerStaticRoutes(r, key, imgPath, imgURLPrefix)
	registerHomeRoutes(r, key)
	registerProfileRoutes(r, key, imgPath, imgURLPrefix, profileRepo)
	registerExperienceRoutes(r, key, imgPath, imgURLPrefix, experiencesRepo)
	registerProjectRoutes(r, key, projectsRepo)
	registerEducationRoutes(r, key, imgPath, imgURLPrefix, educationsRepo)
	registerPostRoutes(r, key, postsRepo)
}
