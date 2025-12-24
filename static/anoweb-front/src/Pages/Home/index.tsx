// src/components/Home/index.tsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../Contexts/admin_context";
import { useHomeData } from "./useHomeData";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import LatestPostCard from "./LatestPostCard";

export default function Home() {
  const { isAdmin } = useContext(AdminContext);
  const { profile, education, experience, setExperience, latestPost } =
    useHomeData();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-[#e8f0fe]/60 to-green-100/60" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] p-6 md:p-8 lg:p-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Overview</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Clarity-first, Google-inspired portfolio console.
            </h1>
            <p className="text-slate-700 leading-relaxed max-w-3xl">
              A concise hub for profile, education, experience, and the newest writing pulled straight from the live portfolio
              API—built to be skimmable and fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                View projects
              </Link>
              <a
                href="https://drive.google.com/file/d/1lJQSIysTrcrDtCgAK0koo-gIb0rhaJAK/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50"
              >
                Download CV
              </a>
              {isAdmin && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Admin mode
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <LatestPostCard post={latestPost} size="default" />
            <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white grid place-items-center font-semibold">
                  API
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="font-semibold text-slate-900">Live portfolio endpoints</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-3">
                Data on this page comes directly from the Go backend: profile, education, experiences, projects, and posts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <ProfileCard profile={profile} />
        <EducationCard education={education} />
      </section>

      <section className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Experience</p>
            <h2 className="text-2xl font-semibold text-slate-900">Career path</h2>
          </div>
          {isAdmin && (
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-100">Drag to reprioritise (admin)</span>
          )}
        </div>
        <ExperienceCard experience={experience} setExperience={setExperience} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/projects"
          className="group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200/80 p-6 md:p-8 flex items-center gap-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          <div className="relative h-12 w-12 rounded-2xl bg-blue-600 text-white grid place-items-center text-xl font-semibold shadow-md">↗</div>
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Navigate</p>
            <h3 className="text-xl font-semibold text-slate-900">Projects workspace</h3>
            <p className="text-sm text-slate-700 mt-1">Review projects, read posts, and manage content from a Google-like console.</p>
          </div>
        </Link>
        <a
          href="mailto:zhouzhouzhang@gmail.com"
          className="group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200/80 p-6 md:p-8 flex items-center gap-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          <div className="relative h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center text-xl font-semibold shadow-md">✉</div>
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Contact</p>
            <h3 className="text-xl font-semibold text-slate-900">Get in touch</h3>
            <p className="text-sm text-slate-700 mt-1">Reach out for collaboration, consulting, or a quick coffee chat.</p>
          </div>
        </a>
      </section>
    </div>
  );
}
