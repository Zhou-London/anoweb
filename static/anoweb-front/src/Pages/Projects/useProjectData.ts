// src/components/ProjectPage/useProjectData.ts

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Project, type PostShort, type Post } from "./types";

export function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<PostShort[]>([]);

  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingPostDetail, setIsLoadingPostDetail] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const refreshProjects = useCallback(() => {
    setIsLoadingProjects(true);
    fetch("/api/project")
      .then((res) => res.json())
      .then((data: Project[]) => {
        setProjects(data);
        if (data.length > 0 && selectedProjectId === null) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  }, [selectedProjectId]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const refreshPosts = useCallback(() => {
    if (selectedProjectId === null) return;

    setIsLoadingPosts(true);
    setPosts([]);
    fetch(`/api/project/${selectedProjectId}/posts`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("API did not return an array for posts:", data);
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      })
      .finally(() => setIsLoadingPosts(false));
  }, [selectedProjectId]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts, selectedProjectId]);

  const handleViewPost = (postId: number) => {
    setIsLoadingPostDetail(true);
    setViewingPost({
      id: postId,
      name: "Loading...",
      content_md: "Please wait...",
      updated_at: "",
    });

    fetch(`/api/project/post/${postId}`)
      .then((res) => res.json())
      .then((data: Post) => {
        setViewingPost(data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingPostDetail(false));
  };

  const handleDeletePost = useCallback(
    async (postId: number) => {
      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }

      try {
        const response = await fetch(`/api/project/post/${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        refreshPosts();
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    },
    [refreshPosts]
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  return {
    projects,
    posts,
    viewingPost,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    isLoadingPosts,
    isLoadingPostDetail,
    setSelectedProjectId,
    setViewingPost,
    handleViewPost,
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    refreshProjects,
    isCreatePostModalOpen,
    openCreatePostModal: () => setIsCreatePostModalOpen(true),
    closeCreatePostModal: () => setIsCreatePostModalOpen(false),
    refreshPosts,
    handleDeletePost,
  };
}