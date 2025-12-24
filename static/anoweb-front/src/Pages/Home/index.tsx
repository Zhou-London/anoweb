// src/components/Home/index.tsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts/user_context";
import { useHomeData } from "./useHomeData";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import LatestPostCard from "./LatestPostCard";

export default function Home() {
  const { isAdmin } = useContext(UserContext);
  const { profile, education, experience, setExperience, latestPost } =
    useHomeData();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-[#e8f0fe]/60 to-green-100/60" aria-hidden />
        <div className="relative space-y-4 p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Overview</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Recent posts</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Open posts
              </Link>
              {isAdmin && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Admin
                </span>
              )}
            </div>
          </div>
          {latestPost ? (
            <LatestPostCard post={latestPost} size="default" />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-slate-600">
              No posts yet. Add one from Projects.
            </div>
          )}
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
            <p className="text-sm text-slate-700 mt-1">Review projects and posts quickly.</p>
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
            <p className="text-sm text-slate-700 mt-1">Reach out for collaboration.</p>
          </div>
        </a>
      </section>
    </div>
  );
}
