package project

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/internal/util"
	"github.com/gin-gonic/gin"
)

// GetProjects godoc
// @Summary List projects
// @Tags project
// @Produce json
// @Success 200 {array} models.Project
// @Failure 500 {object} ErrorResponse
// @Router /project [get]
func GetProjects(c *gin.Context, project_repo ProjectRepository) {
	projects, err := project_repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

// PostProject godoc
// @Summary Create project
// @Tags project
// @Accept json
// @Produce json
// @Param body body models.Project true "Project"
// @Success 201 {object} models.Project
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /project [post]
func PostProject(c *gin.Context, project_repo ProjectRepository) {
	var project Project
	if err := c.ShouldBind(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := project_repo.Create(&project)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	project.ID = id
	c.JSON(http.StatusCreated, project)
}

// PostProjectImg godoc
// @Summary Update project image URL
// @Tags project
// @Accept json
// @Produce json
// @Param body body ProjectImageUpdateRequest true "Project image update"
// @Success 200 {object} models.Project
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /project/update-image-url [post]
func PostProjectImg(c *gin.Context, project_repo ProjectRepository) {
	type RequestBody struct {
		ID       int    `json:"id"`
		ImageURL string `json:"image_url"`
	}

	var req RequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project, err := project_repo.UpdateImageUrl(req.ID, req.ImageURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, project)
}

// PutProject godoc
// @Summary Update project
// @Tags project
// @Accept json
// @Produce json
// @Param body body models.Project true "Project fields"
// @Success 200 {object} models.Project
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /project [put]
func PutProject(c *gin.Context, project_repo ProjectRepository) {
	var project Project
	if err := c.ShouldBind(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oldProject, err := project_repo.GetByID(project.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldProject == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project not found"})
		return
	}

	project.Name = util.PickOrDefault(project.Name, oldProject.Name)
	project.Description = util.PickOrDefault(project.Description, oldProject.Description)
	project.Link = util.PickOrDefault(project.Link, oldProject.Link)
	project.ImageURL = util.PickOrDefault(project.ImageURL, oldProject.ImageURL)

	updatedProject, err := project_repo.Update(project.ID, &project)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProject)

}

// DeleteProject godoc
// @Summary Delete project
// @Tags project
// @Produce json
// @Param id path int true "Project ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /project/{id} [delete]
func DeleteProject(c *gin.Context, project_repo ProjectRepository) {
	id := c.Param("id")
	projectID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	err = project_repo.Delete(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeleteProject() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
