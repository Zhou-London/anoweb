// src/components/Home/index.tsx
import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
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
  const notifySuccess = useSuccessNotifier();
  const { profile, education, experience, setExperience, recentPosts, coreSkills, setCoreSkills } = useHomeData();
  const [totalHours, setTotalHours] = useState(0);
  const [userHours, setUserHours] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [draggedSkill, setDraggedSkill] = useState<CoreSkill | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CoreSkill | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillBullets, setSkillBullets] = useState<string[]>([]);
  const [savingSkill, setSavingSkill] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

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
    try {
      await apiJson(`/core-skill/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCoreSkills(coreSkills.filter((s) => s.id !== id));
      notifySuccess("Skill deleted successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  const handleEditSkill = (skill: CoreSkill) => {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSkillBullets(skill.bullet_points || []);
    setShowSkillModal(true);
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setSkillName("");
    setSkillBullets([]);
    setShowSkillModal(true);
  };

  const handleSaveSkill = async () => {
    if (!skillName.trim()) {
      notifyError("Skill name is required");
      return;
    }

    setSavingSkill(true);
    try {
      const skillData = {
        name: skillName.trim(),
        bullet_points: skillBullets.filter((b) => b.trim()),
        order_index: editingSkill ? editingSkill.order_index : coreSkills.length,
      };

      if (editingSkill) {
        const updated = await apiJson<CoreSkill>("/core-skill", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...skillData, id: editingSkill.id }),
          credentials: "include",
        });
        setCoreSkills(coreSkills.map((s) => (s.id === editingSkill.id ? updated : s)));
        notifySuccess("Skill updated successfully!");
      } else {
        const created = await apiJson<CoreSkill>("/core-skill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(skillData),
          credentials: "include",
        });
        setCoreSkills([...coreSkills, created]);
        notifySuccess("Skill added successfully!");
      }
      setShowSkillModal(false);
      setSkillName("");
      setSkillBullets([]);
      setEditingSkill(null);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to save skill");
    } finally {
      setSavingSkill(false);
    }
  };

  const visiblePosts = isOverviewExpanded ? recentPosts : recentPosts.slice(0, 6);
  const hasMorePosts = recentPosts.length > 6;

  return (
    <div className="space-y-6">
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
                <p className="text-sm font-semibold text-slate-700">Start tracking</p>
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
        <div className="relative space-y-4 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-slate-700">Overview</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Recent posts</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                See more projects
              </Link>
              {showAdminFeatures && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Admin
                </span>
              )}
            </div>
          </div>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              <motion.div layout className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {visiblePosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden md:min-w-[320px] md:max-w-[320px] flex-shrink-0"
                    >
                      <LatestPostCard post={post} size="default" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {hasMorePosts && (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsOverviewExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {isOverviewExpanded ? "Show Less" : "Show More"}
                    <span aria-hidden>{isOverviewExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-slate-600">
              No posts found.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <ProfileCard profile={profile} />
        <EducationCard education={education} />
      </section>

      {/* Core Skills Section */}
      {(coreSkills.length > 0 || showAdminFeatures) && (
        <section className="rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-200 shadow-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" aria-hidden />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-purple-700">Skills</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Core Skills</h2>
              </div>
              {showAdminFeatures && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSkill}
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

      <section className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-slate-700">Experience</p>
            <h2 className="text-2xl font-semibold text-slate-900">Career path</h2>
          </div>
          {showAdminFeatures && (
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-100">Drag to reprioritise (admin)</span>
          )}
        </div>
        <ExperienceCard experience={experience} setExperience={setExperience} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          to="/projects"
          className="group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200/80 p-6 md:p-8 flex items-center gap-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          <div className="relative h-12 w-12 rounded-2xl bg-blue-600 text-white grid place-items-center text-xl font-semibold shadow-md">↗</div>
          <div className="relative">
            <p className="text-sm font-semibold text-slate-700">Navigate</p>
            <h3 className="text-xl font-semibold text-slate-900">Projects workspace</h3>
            <p className="text-sm text-slate-700 mt-1">Review projects and posts quickly.</p>
          </div>
        </Link>
        <a
          href="mailto:zhouzhouzhang@gmail.com"
          className="group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200/80 p-6 md:p-8 flex items-center gap-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          <div className="relative h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center text-xl font-semibold shadow-md">✉</div>
          <div className="relative">
            <p className="text-sm font-semibold text-slate-700">Contact</p>
            <h3 className="text-xl font-semibold text-slate-900">Get in touch</h3>
            <p className="text-sm text-slate-700 mt-1">Reach out for collaboration.</p>
          </div>
        </a>
      </section>

      {/* Add/Edit Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSkillModal(false)}>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{editingSkill ? "Edit Skill" : "Add New Skill"}</h3>
              <button
                onClick={() => setShowSkillModal(false)}
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="skill-name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Skill Name *
                </label>
                <input
                  id="skill-name"
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., React, TypeScript, Leadership"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bullet Points</label>
                <div className="space-y-2">
                  {skillBullets.map((bullet, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...skillBullets];
                          newBullets[index] = e.target.value;
                          setSkillBullets(newBullets);
                        }}
                        placeholder={`Point ${index + 1}`}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                      />
                      <button
                        onClick={() => setSkillBullets(skillBullets.filter((_, i) => i !== index))}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSkillBullets([...skillBullets, ""])}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Bullet Point
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowSkillModal(false)}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkill}
                disabled={savingSkill || !skillName.trim()}
                className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
              >
                {savingSkill ? "Saving..." : editingSkill ? "Update Skill" : "Add Skill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
