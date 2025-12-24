import type { Education } from "./types";

type EducationCardProps = {
  education: Education[];
};

export default function EducationCard({ education }: EducationCardProps) {
  if (education.length === 0) return null;

  return (
    <article className="bg-white/90 rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Education</p>
          <h2 className="text-xl font-semibold text-slate-900">Academic trail</h2>
        </div>
        <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-100">
          {education.length} entries
        </span>
      </div>
      <ul className="space-y-3 flex-1 overflow-auto scrollbar-clear">
        {education.map((edu) => (
          <a
            key={edu.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 hover:from-indigo-50/50 hover:to-white p-4 transition-all duration-200 shadow-sm cursor-pointer"
            href={edu.link}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-4">
              <img src={edu.image_url} alt={edu.school} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{edu.school}</p>
                <p className="text-xs text-slate-600 truncate">{edu.degree}</p>
                <p className="text-xs text-slate-500">{edu.start_date} – {edu.end_date}</p>
              </div>
              <div className="hidden sm:block text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">Open</div>
            </div>
          </a>
        ))}
      </ul>
    </article>
  );
}
