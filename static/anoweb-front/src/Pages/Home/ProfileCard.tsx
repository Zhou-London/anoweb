import type { Profile } from "./types";

type ProfileCardProps = {
  profile: Profile | null;
};

const fields = [
  { label: "Email", key: "email" as const, icon: "✉", buildHref: (value: string) => `mailto:${value}` },
  { label: "GitHub", key: "github" as const, icon: "🐙", buildHref: (value: string) => value },
  { label: "LinkedIn", key: "linkedin" as const, icon: "💼", buildHref: (value: string) => value },
];

function readableLinkText(key: "email" | "github" | "linkedin", raw: string) {
  if (!raw) return "";
  if (key === "email") return "Email";
  try {
    const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(normalized);
    const pathname = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const condensedPath = pathname.length ? `/${pathname[0]}` : "";
    return `${url.hostname}${condensedPath}`;
  } catch {
    if (key === "github") return "GitHub profile";
    if (key === "linkedin") return "LinkedIn profile";
    return "View link";
  }
}

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
        <div className="min-w-0 space-y-3 flex-1">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile</p>
            <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {fields.map((field) => {
              const value = profile[field.key];
              const href = value ? field.buildHref(value) : undefined;
              const displayText = value ? readableLinkText(field.key, value) : "";
              return (
                <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-1 shadow-sm">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1">
                    <span aria-hidden>{field.icon}</span>
                    {field.label}
                  </dt>
                  <dd className="text-sm text-slate-800 break-all">
                    {href ? (
                      <a
                        className="text-blue-700 hover:text-blue-800 font-semibold"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        title={value}
                      >
                        {displayText}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </article>
  );
}
