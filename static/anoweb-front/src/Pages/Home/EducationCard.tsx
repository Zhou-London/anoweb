import type { Education } from "./types";

type EducationCardProps = {
  education: Education[];
};

function formatRange(start: string, end: string) {
  const normalize = (value: string) => value?.split("T")[0] || "";
  if (!start && !end) return "Date not provided";
  return `${normalize(start)} – ${normalize(end) || "Present"}`;
}

function EducationRow({ edu }: { edu: Education }) {
  return (
    <li className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 hover:from-indigo-50/50 hover:to-white p-4 transition-all duration-200 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <img
            src={edu.image_url}
            alt={edu.school}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/64?text=Edu";
            }}
            className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-200 bg-white"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">{edu.school}</p>
            <span className="rounded-full bg-slate-50 border border-slate-200 text-[11px] px-2 py-0.5 text-slate-700">
              {formatRange(edu.start_date, edu.end_date)}
            </span>
          </div>
          <p className="text-xs text-slate-600 truncate">{edu.degree}</p>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            {edu.link ? (
              <a
                href={edu.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800 font-semibold"
              >
                View credential
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                No link provided
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function EducationCard({ education }: EducationCardProps) {
  return (
    <article className="bg-white/90 rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Education</p>
          <h2 className="text-xl font-semibold text-slate-900">Academic trail</h2>
        </div>
        <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-100">
          {education.length} {education.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      {education.length === 0 ? (
        <div className="flex-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-600 grid place-items-center text-sm px-4 py-10">
          No education added yet.
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-auto scrollbar-clear" aria-label="Education history">
          {education.map((edu) => (
            <EducationRow key={edu.id} edu={edu} />
          ))}
        </ul>
      )}
    </article>
  );
}
