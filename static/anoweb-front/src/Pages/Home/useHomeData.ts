import { useState, useEffect } from "react";
import { apiJson } from "../../lib/api";
import type { Profile, Education, Experience, CoreSkill, Post } from "./types";
import type { Project } from "../Projects/types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [coreSkills, setCoreSkills] = useState<CoreSkill[]>([]);

  useEffect(() => {
    apiJson<Profile>("/profile").then(setProfile).catch(() => setProfile(null));
    apiJson<Education[]>("/education").then(setEducation).catch(() => setEducation([]));
    apiJson<Experience[]>("/experience/short")
      .then(setExperience)
      .catch(() => setExperience([]));

    // Fetch both projects and posts, then sort projects by their most recent post
    Promise.all([
      apiJson<Project[]>("/project"),
      apiJson<Post[]>("/post"),
    ])
      .then(([projects, posts]) => {
        // Group posts by parent_id (project_id) and find the most recent post date for each project
        const projectLatestPostDate = new Map<number, Date>();
        posts.forEach((post) => {
          if (post.parent_type === "project") {
            const postDate = new Date(post.updated_at || post.created_at);
            const currentLatest = projectLatestPostDate.get(post.parent_id);
            if (!currentLatest || postDate > currentLatest) {
              projectLatestPostDate.set(post.parent_id, postDate);
            }
          }
        });

        // Sort projects by their most recent post date (projects with posts first, then by date)
        const sortedProjects = [...projects].sort((a, b) => {
          const aDate = projectLatestPostDate.get(a.id);
          const bDate = projectLatestPostDate.get(b.id);

          // Projects with posts come first
          if (aDate && !bDate) return -1;
          if (!aDate && bDate) return 1;
          if (aDate && bDate) return bDate.getTime() - aDate.getTime();

          // For projects without posts, sort by project's own updated_at/created_at
          return (
            new Date(b.updated_at || b.created_at || 0).getTime() -
            new Date(a.updated_at || a.created_at || 0).getTime()
          );
        });

        setRecentProjects(sortedProjects.slice(0, 3));
      })
      .catch(() => setRecentProjects([]));

    apiJson<CoreSkill[]>("/core-skill").then(setCoreSkills).catch(() => setCoreSkills([]));
  }, []);

  return { profile, education, setEducation, experience, setExperience, recentProjects, coreSkills, setCoreSkills };
}
