package coreskill

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// GetCoreSkills godoc
// @Summary List core skills
// @Tags core-skill
// @Produce json
// @Success 200 {array} models.CoreSkill
// @Failure 500 {object} ErrorResponse
// @Router /core-skill [get]
func GetCoreSkills(c *gin.Context, coreSkillRepo CoreSkillRepository) {
	coreSkills, err := coreSkillRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coreSkills)
}

// PostCoreSkill godoc
// @Summary Create core skill
// @Tags core-skill
// @Accept json
// @Produce json
// @Param body body models.CoreSkill true "Core skill"
// @Success 201 {object} models.CoreSkill
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /core-skill [post]
func PostCoreSkill(c *gin.Context, coreSkillRepo CoreSkillRepository) {
	var coreSkill CoreSkill
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

// PutCoreSkill godoc
// @Summary Update core skill
// @Tags core-skill
// @Accept json
// @Produce json
// @Param body body models.CoreSkill true "Core skill fields"
// @Success 200 {object} models.CoreSkill
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /core-skill [put]
func PutCoreSkill(c *gin.Context, coreSkillRepo CoreSkillRepository) {
	var coreSkill CoreSkill
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

// DeleteCoreSkill godoc
// @Summary Delete core skill
// @Tags core-skill
// @Produce json
// @Param id path int true "Core skill ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /core-skill/{id} [delete]
func DeleteCoreSkill(c *gin.Context, coreSkillRepo CoreSkillRepository) {
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

// UpdateCoreSkillOrder godoc
// @Summary Update core skill order
// @Tags core-skill
// @Accept json
// @Produce json
// @Param body body []models.CoreSkill true "Core skills with updated order_index"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /core-skill/update-order [post]
func UpdateCoreSkillOrder(c *gin.Context, coreSkillRepo CoreSkillRepository) {
	var skills []CoreSkill
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
