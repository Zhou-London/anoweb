import { useState, useEffect } from "react";
import { apiJson } from "../../lib/api";
import type { Profile, Education, Experience, Post, CoreSkill } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [coreSkills, setCoreSkills] = useState<CoreSkill[]>([]);

  useEffect(() => {
    apiJson<Profile>("/profile").then(setProfile).catch(() => setProfile(null));
    apiJson<Education[]>("/education").then(setEducation).catch(() => setEducation([]));
    apiJson<Experience[]>("/experience/short")
      .then(setExperience)
      .catch(() => setExperience([]));
    apiJson<Post[]>("/post")
      .then((posts) =>
        setRecentPosts(
          [...posts].sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at).getTime() -
              new Date(a.updated_at || a.created_at).getTime(),
          ),
        ),
      )
      .catch(() => setRecentPosts([]));
    apiJson<CoreSkill[]>("/core-skill").then(setCoreSkills).catch(() => setCoreSkills([]));
  }, []);

  return { profile, education, experience, setExperience, recentPosts, coreSkills, setCoreSkills };
}
