// src/components/ProjectPage/useProjectData.ts

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiFetch, apiJson } from "../../lib/api";
import { type Project, type PostShort } from "./types";

export function useProjectData() {
  const navigate = useNavigate();
  const notifyError = useErrorNotifier();
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<PostShort[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const refreshProjects = useCallback(() => {
    setIsLoadingProjects(true);
    apiJson<Project[]>("/project")
      .then((data) => {
        setProjects(data);
        if (data.length > 0 && selectedProjectId === null) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch((err) => notifyError(err, "Failed to load projects"))
      .finally(() => setIsLoadingProjects(false));
  }, [selectedProjectId, notifyError]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const refreshPosts = useCallback(() => {
    if (selectedProjectId === null) return;

    setIsLoadingPosts(true);
    setPosts([]);
    apiJson<PostShort[]>(`/post/project/${selectedProjectId}`)
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        notifyError(err, "Failed to load posts");
        setPosts([]);
      })
      .finally(() => setIsLoadingPosts(false));
  }, [selectedProjectId, notifyError]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts, selectedProjectId]);

  const handleViewPost = (postId: number) => {
    navigate(`/markdown/${postId}`);
  };

  const handleDeletePost = useCallback(
    async (postId: number) => {
      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }

      try {
        await apiFetch(`/post/${postId}`, {
          method: "DELETE",
        });

        refreshPosts();
      } catch (err) {
        notifyError(err, "Failed to delete post");
      }
    },
    [refreshPosts, notifyError]
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  return {
    projects,
    posts,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    isLoadingPosts,
    setSelectedProjectId,
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
