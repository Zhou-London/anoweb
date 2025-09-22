

import { useState, useEffect } from "react";
import type { Profile, Education, Experience } from "./types";

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

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
  }, []);

  return { profile, education, experience, setExperience };
}