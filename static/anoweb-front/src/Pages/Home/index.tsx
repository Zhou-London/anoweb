// src/components/Home/index.tsx
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useHomeData } from "./useHomeData";
import { apiJson } from "../../lib/api";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import LatestPostCard from "./LatestPostCard";

export default function Home() {
  const { user, isAdmin } = useContext(UserContext);
  const notifyError = useErrorNotifier();
  const { profile, education, experience, setExperience, latestPost } = useHomeData();
  const [totalHours, setTotalHours] = useState(0);
  const [userHours, setUserHours] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const totalData = await apiJson<{ total_hours: number }>("/tracking/total-hours", {
          credentials: "include",
        });
        setTotalHours(totalData.total_hours);

        if (user) {
          const userHoursData = await apiJson<{ total_hours: number }>("/tracking/user-hours", {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours);
        }
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Failed to load statistics");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, notifyError]);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-slate-200 shadow-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" aria-hidden />
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-2xl font-bold shadow-lg">
              🌍
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {loadingStats ? "..." : `${totalHours.toFixed(1)}h`}
              </h2>
              <p className="text-sm text-slate-700 mt-1">Spent by all users on this web</p>
            </div>
          </div>
        </div>

        {user ? (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-slate-200 shadow-lg p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white grid place-items-center text-2xl font-bold shadow-lg">
                ⏱️
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {loadingStats ? "..." : `${userHours.toFixed(1)}h`}
                </h2>
                <p className="text-sm text-slate-700 mt-1">Spent by you on this web</p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/activity"
            className="group rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-slate-200 shadow-lg p-6 md:p-8 relative overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white grid place-items-center text-2xl font-bold shadow-lg">
                🚀
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Start Tracking</p>
                <h2 className="text-2xl font-bold text-slate-900">Sign up to track your time</h2>
                <p className="text-sm text-slate-700 mt-1">Join the community and see your impact</p>
              </div>
            </div>
          </Link>
        )}
      </div>
      {/* Guest Sign-Up Invitation */}
      {!user && (
        <section className="rounded-3xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-200 shadow-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5" aria-hidden />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white grid place-items-center text-3xl font-bold shadow-lg">
              ✨
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Unlock Your Full Potential!
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Join our vibrant community today and gain access to exclusive features, personalized tracking, and so much more. Your journey to greatness starts here!
              </p>
              <Link
                to="/activity"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Sign Up Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

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
