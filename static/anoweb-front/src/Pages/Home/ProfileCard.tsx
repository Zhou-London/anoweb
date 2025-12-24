import type { Profile } from "./types";

type ProfileCardProps = {
  profile: Profile | null;
};

export default function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) {
    return (
      <div className="bg-white/80 rounded-3xl shadow-lg p-6 w-full border border-slate-200 animate-pulse h-[420px]" />
    );
  }

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-8">
      <div className="flex items-start gap-4 md:gap-6">
        <div className="shrink-0">
          <img
            src="/image/profile-img.png"
            alt="Profile"
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
        </div>
        <div className="min-w-0 space-y-2 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile</p>
          <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
          <p className="text-slate-700 leading-relaxed line-clamp-3 whitespace-pre-line">{profile.bio}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <a href={`mailto:${profile.email}`} className="chip-soft">
              {profile.email}
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="chip-soft">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="chip-soft">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
