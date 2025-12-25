import { useState, useEffect } from "react";
import { apiJson } from "../../lib/api";
import type { Profile, Education, Experience, Post, CoreSkill } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [coreSkills, setCoreSkills] = useState<CoreSkill[]>([]);

  useEffect(() => {
    apiJson<Profile>("/profile").then(setProfile).catch(() => setProfile(null));
    apiJson<Education[]>("/education").then(setEducation).catch(() => setEducation([]));
    apiJson<Experience[]>("/experience/short")
      .then(setExperience)
      .catch(() => setExperience([]));
    apiJson<Post>("/post/latest").then(setLatestPost).catch(() => setLatestPost(null));
    apiJson<CoreSkill[]>("/core-skill").then(setCoreSkills).catch(() => setCoreSkills([]));
  }, []);

  return { profile, education, experience, setExperience, latestPost, coreSkills, setCoreSkills };
}