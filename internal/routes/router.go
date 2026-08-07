package routes

import (
	"anonchihaya.co.uk/internal/announcement"
	"anonchihaya.co.uk/internal/auth"
	"anonchihaya.co.uk/internal/blog"
	"anonchihaya.co.uk/internal/comment"
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
	blogRepo blog.BlogRepository,
	blogLikeRepo blog.BlogLikeRepository,
	announcementRepo announcement.AnnouncementRepository,
	commentRepo comment.CommentRepository,
) {
	registerSwaggerRoutes(r)
	registerFanRoutes(r, domain, imgPath, imgURLPrefix, fanRepo, sessionRepo, trackingRepo, blogLikeRepo)
	registerStaticRoutes(r, imgPath, imgURLPrefix, sessionRepo)
	registerProfileRoutes(r, imgPath, imgURLPrefix, profileRepo, sessionRepo)
	registerExperienceRoutes(r, imgPath, imgURLPrefix, experiencesRepo, sessionRepo)
	registerProjectRoutes(r, projectsRepo, sessionRepo)
	registerEducationRoutes(r, imgPath, imgURLPrefix, educationsRepo, sessionRepo)
	registerPostRoutes(r, postsRepo, sessionRepo)
	registerTrackingRoutes(r, trackingRepo, sessionRepo)
	registerMysteryCodeRoutes(r, mysteryCodeRepo, fanRepo, sessionRepo)
	registerGuestPopupRoutes(r, popupRepo, sessionRepo)
	registerStatisticsRoutes(r, statsRepo, trackingRepo, sessionRepo)
	registerCoreSkillRoutes(r, coreSkillRepo, sessionRepo)
	registerBlogRoutes(r, blogRepo, blogLikeRepo, sessionRepo)
	registerAnnouncementRoutes(r, announcementRepo, sessionRepo)
	registerCommentRoutes(r, commentRepo, postsRepo, sessionRepo)
}
