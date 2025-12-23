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
    <article className="relative overflow-hidden rounded-3xl bg-white/90 border border-slate-200 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-100/30 to-indigo-100/40" aria-hidden />
      <div className="relative grid gap-6 md:grid-cols-[220px_1fr] p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-[220px]">
            <img
              src="/image/profile-img.png"
              alt="Profile"
              className="w-full h-[260px] rounded-2xl object-cover shadow-md border border-slate-200"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white px-3 py-1 text-xs font-semibold shadow-md">
              {profile.name}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href={`mailto:${profile.email}`}
              className="chip-soft"
            >
              Email
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="chip-soft">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="chip-soft">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile</p>
          <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</p>
              <p className="font-semibold text-slate-900 break-all">{profile.email}</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Networks</p>
              <p className="font-semibold text-slate-900">GitHub & LinkedIn available</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
