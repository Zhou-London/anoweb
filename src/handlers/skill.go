package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"github.com/gin-gonic/gin"
)

func GetAllSkills(c *gin.Context, skill_repo repositories.SkillRepository) {
	skills, err := skill_repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, skills)
}

func GetSkillByID(c *gin.Context, skill_repo repositories.SkillRepository) {
	id := c.Param("id")
	skillID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill ID"})
		return
	}

	skill, err := skill_repo.GetByID(skillID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"skill": skill})
}

func PostSkill(c *gin.Context, skill_repo repositories.SkillRepository) {
	type SkillRequest struct {
		Name       string `json:"name"`
		Category   string `json:"category"`
		OrderIndex int    `json:"order_index"`
	}

	var req SkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	skill := models.Skill{
		Name:       req.Name,
		Category:   req.Category,
		OrderIndex: req.OrderIndex,
	}

	id, err := skill_repo.Create(&skill)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	skill.ID = id
	c.JSON(http.StatusCreated, skill)
}

func PutSkill(c *gin.Context, skill_repo repositories.SkillRepository) {
	type SkillUpdate struct {
		ID         int     `json:"id"`
		Name       *string `json:"name"`
		Category   *string `json:"category"`
		OrderIndex *int    `json:"order_index"`
	}

	var req SkillUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	oldSkill, err := skill_repo.GetByID(req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if oldSkill == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Skill does not exist"})
		return
	}

	skill := *oldSkill
	if req.Name != nil {
		skill.Name = *req.Name
	}
	if req.Category != nil {
		skill.Category = *req.Category
	}
	if req.OrderIndex != nil {
		skill.OrderIndex = *req.OrderIndex
	}

	_, err = skill_repo.Update(skill.ID, &skill)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, skill)
}

func DeleteSkill(c *gin.Context, skill_repo repositories.SkillRepository) {
	id := c.Param("id")
	skillID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill ID"})
		return
	}

	err = skill_repo.Delete(skillID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Skill deleted successfully"})
}

func PutSkillOrder(c *gin.Context, skill_repo repositories.SkillRepository) {
	type PutSkillOrderRequest struct {
		ID         int `json:"id"`
		OrderIndex int `json:"order_index"`
	}

	var req []PutSkillOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, r := range req {
		_, err := skill_repo.UpdateOrderIndex(r.ID, r.OrderIndex)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"PutSkillOrder() error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Skill order updated successfully"})
}
