package projecthandler

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

func GetPostsShort(c *gin.Context, post_repo repositories.PostRepository) {
	id := c.Param("id")
	projectID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	posts, err := post_repo.GetShortByProject(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func GetPost(c *gin.Context, post_repo repositories.PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := post_repo.GetByID(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

func PostPost(c *gin.Context, post_repo repositories.PostRepository) {

	type PostPostReq struct {
		ParentID  int    `json:"parent_id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
	}

	var postReq PostPostReq
	if err := c.ShouldBindJSON(&postReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.Post{
		ParentID:   postReq.ParentID,
		ParentType: "project",
		Name:       postReq.Name,
		ContentMD:  postReq.ContentMD,
	}

	id, err := post_repo.Create(&post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	post.ID = id
	c.JSON(http.StatusCreated, post)
}

func PutPost(c *gin.Context, post_repo repositories.PostRepository) {
	type PutPostReq struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		ContentMD string `json:"content_md"`
	}

	var putPostReq PutPostReq
	if err := c.ShouldBind(&putPostReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oldPost, err := post_repo.GetByID(putPostReq.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldPost == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		return
	}

	var newPost models.Post
	newPost.ID = putPostReq.ID
	newPost.ParentID = oldPost.ParentID
	newPost.ParentType = oldPost.ParentType
	newPost.Name = util.PickOrDefault(putPostReq.Name, oldPost.Name)
	newPost.ContentMD = util.PickOrDefault(putPostReq.ContentMD, oldPost.ContentMD)

	updatedPost, err := post_repo.Update(newPost.ID, &newPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedPost)
}

func DeletePost(c *gin.Context, post_repo repositories.PostRepository) {
	id := c.Param("id")
	postID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	err = post_repo.Delete(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"DeletePost() error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
