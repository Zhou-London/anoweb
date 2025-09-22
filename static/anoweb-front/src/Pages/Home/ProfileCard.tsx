// src/components/Home/ProfileCard.tsx

import type { Profile } from "./types";

type ProfileCardProps = {
  profile: Profile | null;
};

export default function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) {
    return <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm animate-pulse">Loading Profile...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
      <img
        src="/image/profile-img.png"
        alt="Profile"
        className="w-48 h-64 rounded-lg mx-auto mb-4 shadow-md object-cover"
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</h1>
      <p className="text-gray-600 mb-4">{profile.bio}</p>
      <div className="space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Email:</span> {profile.email}
        </p>
        <p>
          <span className="font-semibold">GitHub:</span>{" "}
          <a href={profile.github} className="text-blue-600 hover:underline">
            Click
          </a>
        </p>
        <p>
          <span className="font-semibold">LinkedIn:</span>{" "}
          <a href={profile.linkedin} className="text-blue-600 hover:underline">
            Click
          </a>
        </p>
      </div>
    </div>
  );
}