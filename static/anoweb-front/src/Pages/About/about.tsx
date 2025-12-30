
export default function About() {
  return (
    <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-10 space-y-4">
      <p className="text-sm font-semibold text-slate-700">About</p>
      <h1 className="text-3xl font-semibold text-slate-900">Designing with a Google-inspired lens</h1>
      <p className="text-slate-700 leading-relaxed">
        Clean surfaces, tight grids, and direct data from the Go APIs keep the experience quick and focused.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Tech stack</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc list-inside">
            <li>React + Vite front end with Tailwind CSS</li>
            <li>Markdown workspace that opens in its own tab</li>
            <li>Go backend exposing profile, education, experience, projects, and post APIs</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Philosophy</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Put the data first, then add the lightest possible chrome so it feels like a console you want to keep open.
          </p>
        </div>
      </div>
    </section>
  );
}
