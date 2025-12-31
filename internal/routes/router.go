package routes

import (
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/coreskill"
	"anonchihaya.co.uk/internal/education"
	"anonchihaya.co.uk/internal/experience"
	"anonchihaya.co.uk/internal/guestpopup"
	"anonchihaya.co.uk/internal/mysterycode"
	"anonchihaya.co.uk/internal/post"
	"anonchihaya.co.uk/internal/profile"
	"anonchihaya.co.uk/internal/project"
	"anonchihaya.co.uk/internal/statistics"
	"anonchihaya.co.uk/internal/tracking"
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
	profileRepo profile.ProfileRepository,
	experiencesRepo experience.ExperienceRepository,
	educationsRepo education.EducationRepository,
	projectsRepo project.ProjectRepository,
	postsRepo post.PostRepository,
	fanRepo *auth.FanRepository,
	sessionRepo *auth.SessionRepository,
	trackingRepo *tracking.FanTrackingRepository,
	mysteryCodeRepo *mysterycode.MysteryCodeRepository,
	popupRepo *guestpopup.GuestPopupConfigRepository,
	statsRepo *statistics.StatisticsRepository,
	coreSkillRepo coreskill.CoreSkillRepository,
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
