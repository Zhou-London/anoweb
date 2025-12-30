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
	fanRepo *repositories.FanRepository,
	sessionRepo *repositories.SessionRepository,
	trackingRepo *repositories.FanTrackingRepository,
	mysteryCodeRepo *repositories.MysteryCodeRepository,
	popupRepo *repositories.GuestPopupConfigRepository,
	statsRepo *repositories.StatisticsRepository,
	coreSkillRepo repositories.CoreSkillRepository,
) {
	registerSwaggerRoutes(r)
	registerFanRoutes(r, domain, imgPath, imgURLPrefix, fanRepo, sessionRepo)
	registerAdminRoutes(r, domain, adminPass, key)
	registerStaticRoutes(r, key, imgPath, imgURLPrefix, sessionRepo)
	registerHomeRoutes(r, key, sessionRepo)
	registerProfileRoutes(r, key, imgPath, imgURLPrefix, profileRepo, sessionRepo)
	registerExperienceRoutes(r, key, imgPath, imgURLPrefix, experiencesRepo, sessionRepo)
	registerProjectRoutes(r, key, projectsRepo, sessionRepo)
	registerEducationRoutes(r, key, imgPath, imgURLPrefix, educationsRepo, sessionRepo)
	registerPostRoutes(r, key, postsRepo, sessionRepo)
	registerTrackingRoutes(r, key, trackingRepo, sessionRepo)
	registerMysteryCodeRoutes(r, key, mysteryCodeRepo, fanRepo, sessionRepo)
	registerGuestPopupRoutes(r, key, popupRepo, sessionRepo)
	registerStatisticsRoutes(r, statsRepo, trackingRepo, sessionRepo)
	registerCoreSkillRoutes(r, key, coreSkillRepo, sessionRepo)
}
