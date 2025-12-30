import type { Profile } from "./types";

type ProfileCardProps = {
  profile: Profile | null;
};

const fields = [
  { label: "email", key: "email" as const, icon: "✉", buildHref: (value: string) => `mailto:${value}` },
  { label: "github", key: "github" as const, icon: "🐙", buildHref: (value: string) => value },
  { label: "linkedin", key: "linkedin" as const, icon: "💼", buildHref: (value: string) => value },
];

export default function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) {
    return (
      <div className="bg-white/80 rounded-3xl shadow-lg p-6 w-full border border-slate-200 animate-pulse h-[420px]" />
    );
  }

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-8">
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <img
            src="/image/profile-img.png"
            alt="Profile"
            className="w-36 h-36 md:w-40 md:h-40 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
        </div>
        <div className="min-w-0 space-y-4 flex-1">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Profile</p>
            <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Contact</p>
            <div className="flex flex-col gap-3">
              {fields.map((field) => {
                const value = profile[field.key];
                const href = value ? field.buildHref(value) : undefined;
                const isDisabled = !href;

                return (
                  <button
                    key={field.key}
                    type="button"
                    className={`inline-flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isDisabled
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-white text-blue-800 border border-blue-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-blue-500"
                    }`}
                    onClick={() => href && window.open(href, "_blank", "noopener,noreferrer")}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                  >
                    <span className="lowercase">{field.label}</span>
                    <span aria-hidden className="text-lg leading-none">{field.icon}</span>
                    {href && <span className="sr-only">{value}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
