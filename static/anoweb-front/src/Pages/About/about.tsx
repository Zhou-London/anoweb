
export default function About() {
  return (
    <section className="rounded-3xl shadow-lg p-6 md:p-10 space-y-4" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>About</p>
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--gb-fg)' }}>Designing with a Google-inspired lens</h1>
      <p className="leading-relaxed" style={{ color: 'var(--gb-fg-soft)' }}>
        Clean surfaces, tight grids, and direct data from the Go APIs keep the experience quick and focused.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl p-4" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--gb-fg)' }}>Tech stack</h2>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside" style={{ color: 'var(--gb-fg-soft)' }}>
            <li>React + Vite front end with Tailwind CSS</li>
            <li>Markdown workspace that opens in its own tab</li>
            <li>Go backend exposing profile, education, experience, projects, and post APIs</li>
          </ul>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--gb-fg)' }}>Philosophy</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gb-fg-soft)' }}>
            Put the data first, then add the lightest possible chrome so it feels like a console you want to keep open.
          </p>
        </div>
      </div>
    </section>
  );
}
