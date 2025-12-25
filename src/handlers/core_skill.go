package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/src/models"
	"anonchihaya.co.uk/src/repositories"
	"anonchihaya.co.uk/src/util"
	"github.com/gin-gonic/gin"
)

func GetCoreSkills(c *gin.Context, coreSkillRepo repositories.CoreSkillRepository) {
	coreSkills, err := coreSkillRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coreSkills)
}

func PostCoreSkill(c *gin.Context, coreSkillRepo repositories.CoreSkillRepository) {
	var coreSkill models.CoreSkill
	if err := c.ShouldBind(&coreSkill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := coreSkillRepo.Create(&coreSkill)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	coreSkill.ID = id
	c.JSON(http.StatusCreated, coreSkill)
}

func PutCoreSkill(c *gin.Context, coreSkillRepo repositories.CoreSkillRepository) {
	var coreSkill models.CoreSkill
	if err := c.ShouldBind(&coreSkill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oldCoreSkill, err := coreSkillRepo.GetByID(coreSkill.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldCoreSkill == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CoreSkill not found"})
		return
	}

	coreSkill.Name = util.PickOrDefault(coreSkill.Name, oldCoreSkill.Name)
	if coreSkill.BulletPoints == nil {
		coreSkill.BulletPoints = oldCoreSkill.BulletPoints
	}
	if coreSkill.OrderIndex == 0 {
		coreSkill.OrderIndex = oldCoreSkill.OrderIndex
	}

	updatedCoreSkill, err := coreSkillRepo.Update(coreSkill.ID, &coreSkill)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedCoreSkill)
}

func DeleteCoreSkill(c *gin.Context, coreSkillRepo repositories.CoreSkillRepository) {
	id := c.Param("id")
	coreSkillID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid core skill ID"})
		return
	}

	err = coreSkillRepo.Delete(coreSkillID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeleteCoreSkill() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Core skill deleted successfully"})
}

func UpdateCoreSkillOrder(c *gin.Context, coreSkillRepo repositories.CoreSkillRepository) {
	var skills []models.CoreSkill
	if err := c.ShouldBindJSON(&skills); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := coreSkillRepo.UpdateOrder(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated successfully"})
}
