package handlers

import (
	"net/http"
	"strconv"

	"anonchihaya.co.uk/models"
	"anonchihaya.co.uk/repositories"
	"anonchihaya.co.uk/util"
	"github.com/gin-gonic/gin"
)

func GetProjects(c *gin.Context, project_repo repositories.ProjectRepository) {
	projects, err := project_repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func PostProject(c *gin.Context, project_repo repositories.ProjectRepository) {
	var project models.Project
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

func PostProjectImg(c *gin.Context, project_repo repositories.ProjectRepository) {
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

func PutProject(c *gin.Context, project_repo repositories.ProjectRepository) {
	var project models.Project
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

func DeleteProject(c *gin.Context, project_repo repositories.ProjectRepository) {
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
