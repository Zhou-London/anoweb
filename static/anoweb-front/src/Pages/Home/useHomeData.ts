import { useState, useEffect } from "react";
import { apiJson } from "../../lib/api";
import type { Profile, Education, Experience, Post, Skill } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [latestPost, setLatestPost] = useState<Post | null>(null);

  useEffect(() => {
    apiJson<Profile>("/profile").then(setProfile).catch(() => setProfile(null));
    apiJson<Education[]>("/education").then(setEducation).catch(() => setEducation([]));
    apiJson<Experience[]>("/experience/short")
      .then(setExperience)
      .catch(() => setExperience([]));
    apiJson<Skill[]>("/skill").then(setSkills).catch(() => setSkills([]));
    apiJson<Post>("/post/latest").then(setLatestPost).catch(() => setLatestPost(null));
  }, []);

  return { profile, education, experience, setExperience, skills, setSkills, latestPost };
}