// src/components/Home/index.tsx
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useHomeData } from "./useHomeData";
import { apiJson } from "../../lib/api";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import LatestPostCard from "./LatestPostCard";
import CoreSkillCard from "./CoreSkillCard";
import type { CoreSkill } from "./types";

export default function Home() {
  const { user, isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const { profile, education, experience, setExperience, latestPost, coreSkills, setCoreSkills } = useHomeData();
  const [totalHours, setTotalHours] = useState(0);
  const [userHours, setUserHours] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [draggedSkill, setDraggedSkill] = useState<CoreSkill | null>(null);

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

  const handleDragStart = (e: React.DragEvent, skill: CoreSkill) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetSkill: CoreSkill) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill.id === targetSkill.id) {
      setDraggedSkill(null);
      return;
    }

    const draggedIndex = coreSkills.findIndex((s) => s.id === draggedSkill.id);
    const targetIndex = coreSkills.findIndex((s) => s.id === targetSkill.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSkills = [...coreSkills];
    newSkills.splice(draggedIndex, 1);
    newSkills.splice(targetIndex, 0, draggedSkill);

    const updatedSkills = newSkills.map((skill, index) => ({
      ...skill,
      order_index: index,
    }));

    setCoreSkills(updatedSkills);
    setDraggedSkill(null);

    try {
      await apiJson("/core-skill/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSkills),
        credentials: "include",
      });
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update skill order");
      setCoreSkills(coreSkills);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      await apiJson(`/core-skill/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCoreSkills(coreSkills.filter((s) => s.id !== id));
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  const handleEditSkill = (skill: CoreSkill) => {
    // TODO: Implement edit modal
    console.log("Edit skill:", skill);
    alert("Edit functionality coming soon!");
  };

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

      {/* Core Skills Section */}
      {(coreSkills.length > 0 || showAdminFeatures) && (
        <section className="rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-200 shadow-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" aria-hidden />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-700 font-semibold">Core Skills</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What I Bring to the Table</h2>
              </div>
              {showAdminFeatures && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Add skill functionality - coming soon!\n\nFor now, you can add skills via API:\nPOST /api/core-skill\n{\n  \"name\": \"Skill Name\",\n  \"bullet_points\": [\"Point 1\", \"Point 2\"],\n  \"order_index\": 0\n}")}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Skill
                  </button>
                  <span className="rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-xs font-semibold border border-purple-100">
                    Drag to reorder
                  </span>
                </div>
              )}
            </div>

            {coreSkills.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coreSkills.map((skill) => (
                  <CoreSkillCard
                    key={skill.id}
                    skill={skill}
                    onDragStart={showAdminFeatures ? handleDragStart : undefined}
                    onDragOver={showAdminFeatures ? handleDragOver : undefined}
                    onDrop={showAdminFeatures ? handleDrop : undefined}
                    onDelete={showAdminFeatures ? handleDeleteSkill : undefined}
                    onEdit={showAdminFeatures ? handleEditSkill : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Core Skills Yet</h3>
                <p className="text-slate-600 mb-4">Click "Add Skill" above to showcase your expertise!</p>
              </div>
            )}
          </div>
        </section>
      )}

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
              {showAdminFeatures && (
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
          {showAdminFeatures && (
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
