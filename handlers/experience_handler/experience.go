package experiencehandler

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/util"
	"github.com/gin-gonic/gin"
)

func UploadExperienceImg(c *gin.Context, img_path string, img_url_prefix string) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "file not found")
		return
	}

	dst := img_path + "/experience-img-" + file.Filename
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.String(http.StatusInternalServerError, "save failed: %s", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "upload success",
		"img_path": img_url_prefix + "/experience-img-" + file.Filename,
	})
}

func GetAllExperiences(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	exps, err := experience_repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"experience": exps})
}

func GetExperienceByID(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	id := c.Param("id")
	expID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience ID"})
		return
	}

	exp, err := experience_repo.GetByID(expID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"experience": exp})
}

func PostExperience(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	exp := models.Experience{
		Company:     c.PostForm("company"),
		Position:    c.PostForm("position"),
		StartDate:   c.PostForm("start_date"),
		EndDate:     c.PostForm("end_date"),
		Present:     c.PostForm("present") == "true",
		Description: c.PostForm("description"),
		ImageURL:    c.PostForm("image_url"),
	}

	id, err := experience_repo.Create(&exp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	exp.ID = id
	c.JSON(http.StatusCreated, gin.H{"experience": exp})
}

func PutExperience(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	id := c.PostForm("id")
	expID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience ID"})
		return
	}

	oldExp, err := experience_repo.GetByID(expID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	exp := models.Experience{
		ID:          oldExp.ID,
		Company:     util.PickOrDefault(c.PostForm("company"), oldExp.Company),
		Position:    util.PickOrDefault(c.PostForm("position"), oldExp.Position),
		StartDate:   util.PickOrDefault(c.PostForm("start_date"), oldExp.StartDate),
		EndDate:     util.PickOrDefault(c.PostForm("end_date"), oldExp.EndDate),
		Present:     c.PostForm("present") == "true",
		Description: util.PickOrDefault(c.PostForm("description"), oldExp.Description),
		ImageURL:    util.PickOrDefault(c.PostForm("image_url"), oldExp.ImageURL),
	}

	updatedExp, err := experience_repo.Update(exp.ID, &exp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"experience": updatedExp})
}

func DeleteExperience(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	id := c.Param("id")
	expID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience ID"})
		return
	}

	err = experience_repo.Delete(expID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Experience deleted successfully"})
}
