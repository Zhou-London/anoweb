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
	userRepo *repositories.UserRepository,
	sessionRepo *repositories.SessionRepository,
	trackingRepo *repositories.UserTrackingRepository,
	mysteryCodeRepo *repositories.MysteryCodeRepository,
	popupRepo *repositories.GuestPopupConfigRepository,
) {
	registerUserRoutes(r, domain, imgPath, imgURLPrefix, userRepo, sessionRepo)
	registerAdminRoutes(r, domain, adminPass, key)
	registerStaticRoutes(r, key, imgPath, imgURLPrefix, sessionRepo)
	registerHomeRoutes(r, key, sessionRepo)
	registerProfileRoutes(r, key, imgPath, imgURLPrefix, profileRepo, sessionRepo)
	registerExperienceRoutes(r, key, imgPath, imgURLPrefix, experiencesRepo, sessionRepo)
	registerProjectRoutes(r, key, projectsRepo, sessionRepo)
	registerEducationRoutes(r, key, imgPath, imgURLPrefix, educationsRepo, sessionRepo)
	registerPostRoutes(r, key, postsRepo, sessionRepo)
	registerTrackingRoutes(r, key, trackingRepo, sessionRepo)
	registerMysteryCodeRoutes(r, key, mysteryCodeRepo, userRepo, sessionRepo)
	registerGuestPopupRoutes(r, key, popupRepo, sessionRepo)
}
