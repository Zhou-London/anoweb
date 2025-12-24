package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
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
	type ExperienceRequest struct {
		Company      string   `json:"company"`
		Position     string   `json:"position"`
		StartDate    string   `json:"start_date"`
		EndDate      string   `json:"end_date"`
		Present      bool     `json:"present"`
		Description  string   `json:"description"`
		ImageURL     string   `json:"image_url"`
		OrderIndex   int      `json:"order_index"`
		BulletPoints []string `json:"bullet_points"`
	}

	var req ExperienceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	exp := models.Experience{
		Company:      req.Company,
		Position:     req.Position,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Present:      req.Present,
		Description:  req.Description,
		ImageURL:     req.ImageURL,
		OrderIndex:   req.OrderIndex,
		BulletPoints: req.BulletPoints,
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
	type ExperienceUpdate struct {
		ID           int       `json:"id"`
		Company      *string   `json:"company"`
		Position     *string   `json:"position"`
		StartDate    *string   `json:"start_date"`
		EndDate      *string   `json:"end_date"`
		Present      *bool     `json:"present"`
		Description  *string   `json:"description"`
		ImageURL     *string   `json:"image_url"`
		OrderIndex   *int      `json:"order_index"`
		BulletPoints *[]string `json:"bullet_points"`
	}

	var req ExperienceUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	oldExp, err := experience_repo.GetByID(req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if oldExp == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Experience does not exist"})
		return
	}

	exp := *oldExp
	if req.Company != nil {
		exp.Company = *req.Company
	}
	if req.Position != nil {
		exp.Position = *req.Position
	}
	if req.StartDate != nil {
		exp.StartDate = *req.StartDate
	}
	if req.EndDate != nil {
		exp.EndDate = *req.EndDate
	}
	if req.Present != nil {
		exp.Present = *req.Present
	}
	if req.Description != nil {
		exp.Description = *req.Description
	}
	if req.ImageURL != nil {
		exp.ImageURL = *req.ImageURL
	}
	if req.OrderIndex != nil {
		exp.OrderIndex = *req.OrderIndex
	}
	if req.BulletPoints != nil {
		exp.BulletPoints = *req.BulletPoints
	}

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
