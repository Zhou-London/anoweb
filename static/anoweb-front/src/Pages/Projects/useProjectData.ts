
import { useState, useEffect, useMemo } from "react";
import { type Project, type PostShort, type Post } from "./types";

export function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<PostShort[]>([]);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingPostDetail, setIsLoadingPostDetail] = useState(false);

  useEffect(() => {
    setIsLoadingProjects(true);
    fetch("/api/project")
      .then((res) => res.json())
      .then((data: Project[]) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (selectedProjectId === null) return;
    setIsLoadingPosts(true);
    setPosts([]);
    fetch(`/api/project/${selectedProjectId}/posts`)
      .then((res) => res.json())
      .then((data: PostShort[]) => {
        setPosts(data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingPosts(false));
  }, [selectedProjectId]);
  
  const handleViewPost = (postId: number) => {
    setIsLoadingPostDetail(true);
    setViewingPost({ id: postId, name: "Loading...", content_md: "Please wait...", updated_at: "" });
    fetch(`/api/project/post/${postId}`)
      .then((res) => res.json())
      .then((data: Post) => {
        setViewingPost(data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingPostDetail(false));
  };

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
  };
}