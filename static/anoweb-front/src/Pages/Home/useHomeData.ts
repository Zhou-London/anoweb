import { useState, useEffect } from "react";
import type { Profile, Education, Experience, Post } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [latestPost, setLatestPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/home/profile-info")
      .then((r) => r.json())
      .then((d: Profile) => setProfile(d))
      .catch(() => setProfile(null));

    fetch("/api/home/education")
      .then((r) => r.json())
      .then((d: Education[]) => setEducation(d))
      .catch(() => setEducation([]));

    fetch("/api/home/experience")
      .then((r) => r.json())
      .then((d: Experience[]) => setExperience(d))
      .catch(() => setExperience([]));

    fetch("/api/home/post/latest")
      .then((r) => r.json())
      .then((d: Post) => setLatestPost(d))
      .catch(() => setLatestPost(null));
  }, []);

  return { profile, education, experience, setExperience, latestPost };
}