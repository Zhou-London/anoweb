package handlers

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
	var exp models.Experience
	if err := c.ShouldBind(&exp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
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

	var exp models.Experience
	if err := c.ShouldBind(&exp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	oldExp, err := experience_repo.GetByID(exp.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if oldExp == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Experience does not exist"})
		return
	}

	exp.Company = util.PickOrDefault(exp.Company, oldExp.Company)
	exp.Position = util.PickOrDefault(exp.Position, oldExp.Position)
	exp.StartDate = util.PickOrDefault(exp.StartDate, oldExp.StartDate)
	exp.EndDate = util.PickOrDefault(exp.EndDate, oldExp.EndDate)
	exp.Present = util.PickOrDefault(exp.Present, oldExp.Present)
	exp.Description = util.PickOrDefault(exp.Description, oldExp.Description)
	exp.ImageURL = util.PickOrDefault(exp.ImageURL, oldExp.ImageURL)
	exp.OrderIndex = util.PickOrDefault(exp.OrderIndex, oldExp.OrderIndex)

	_, err = experience_repo.Update(exp.ID, &exp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"experience": exp})
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

func GetExperiencesShort(c *gin.Context, experience_repo repositories.ExperienceRepository) {
	experiences, err := experience_repo.GetAllShort()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"GetExperiencesShort() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, experiences)
}

func PutExperienceOrder(c *gin.Context, experience_repo repositories.ExperienceRepository) {

	type PutExperienceOrderRequest struct {
		ID         int `json:"id"`
		OrderIndex int `json:"order_index"`
	}

	var req []PutExperienceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, r := range req {
		_, err := experience_repo.UpdateOrderIndex(r.ID, r.OrderIndex)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"PutExperienceOrder() error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Experience order updated successfully"})
}
