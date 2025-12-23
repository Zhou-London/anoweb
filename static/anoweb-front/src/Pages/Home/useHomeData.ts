import { useState, useEffect } from "react";
import { apiJson } from "../../lib/api";
import type { Profile, Education, Experience, Post } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [latestPost, setLatestPost] = useState<Post | null>(null);

  useEffect(() => {
    apiJson<Profile>("/home/profile-info").then(setProfile).catch(() => setProfile(null));
    apiJson<Education[]>("/home/education").then(setEducation).catch(() => setEducation([]));
    apiJson<Experience[]>("/home/experience").then(setExperience).catch(() => setExperience([]));
    apiJson<Post>("/home/post/latest").then(setLatestPost).catch(() => setLatestPost(null));
  }, []);

  return { profile, education, experience, setExperience, latestPost };
}