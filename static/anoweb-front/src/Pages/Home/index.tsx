// src/components/Home/index.tsx
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useHomeData } from "./useHomeData";
import { apiJson } from "../../lib/api";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import CoreSkillCard from "./CoreSkillCard";
import type { CoreSkill } from "./types";

export default function Home() {
  const { fan, isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const notifySuccess = useSuccessNotifier();
  const { profile, education, setEducation, experience, setExperience, recentProjects, coreSkills, setCoreSkills, recentBlogs } = useHomeData();
  const [totalHours, setTotalHours] = useState(0);
  const [userHours, setUserHours] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [draggedSkill, setDraggedSkill] = useState<CoreSkill | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CoreSkill | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillBullets, setSkillBullets] = useState<string[]>([]);
  const [savingSkill, setSavingSkill] = useState(false);
  const [newFans, setNewFans] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const totalData = await apiJson<{ total_hours: number }>("/tracking/total-hours", {
          credentials: "include",
        });
        setTotalHours(totalData.total_hours);

        if (fan) {
          const userHoursData = await apiJson<{ total_hours: number }>("/tracking/user-hours", {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours);
        }
      } catch (err) {
        notifyError(err, "Failed to load statistics");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [fan, notifyError]);

  useEffect(() => {
    const fetchNewFans = async () => {
      if (fan) {
        try {
          const fans = await apiJson<any[]>("/user/list", {
            credentials: "include",
          });
          setNewFans(fans.slice(0, 3));
        } catch (err) {
          console.error("Failed to load new fans:", err);
        }
      }
    };
    fetchNewFans();
  }, [fan]);

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
      notifyError(err, "Failed to update skill order");
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
      notifyError(err, "Failed to delete skill");
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
      notifyError(err, "Failed to save skill");
    } finally {
      setSavingSkill(false);
    }
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        <div className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 relative overflow-hidden" style={{ background: 'var(--gb-primary)', boxShadow: 'var(--gb-shadow-card)' }}>
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl grid place-items-center text-xl sm:text-2xl font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fbf1c7' }}>
              ~
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#fbf1c7' }}>
                {loadingStats ? "..." : `${totalHours.toFixed(1)}h`}
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(251,241,199,0.8)' }}>Spent by all fans on this web</p>
            </div>
          </div>
        </div>

        {fan ? (
          <div className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 relative overflow-hidden" style={{ background: 'var(--gb-warning)', boxShadow: 'var(--gb-shadow-card)' }}>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl grid place-items-center text-xl sm:text-2xl font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fbf1c7' }}>
                @
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#fbf1c7' }}>
                  {loadingStats ? "..." : `${userHours.toFixed(1)}h`}
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(251,241,199,0.8)' }}>Spent by you on this web</p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/community"
            className="group rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 relative overflow-hidden hover:shadow-xl transition-shadow"
            style={{ background: 'var(--gb-warning)', boxShadow: 'var(--gb-shadow-card)' }}
          >
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl grid place-items-center text-xl sm:text-2xl font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fbf1c7' }}>
                !
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#fbf1c7' }}>Sign up for full access</h2>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Profile and Education Cards */}
      <section className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <ProfileCard profile={profile} />
        <EducationCard education={education} setEducation={setEducation} />
      </section>

      {/* New Fans Section */}
      <section className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 relative overflow-hidden" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <div className="relative">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--gb-fg)' }}>
            <span>~</span> New Fans
          </h2>
          {!fan ? (
            <div className="blur-sm select-none pointer-events-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full" style={{ background: 'var(--gb-primary)' }} />
                      <div className="flex-1">
                        <div className="h-4 rounded w-24 mb-1" style={{ background: 'var(--gb-bg-muted)' }} />
                        <div className="h-3 rounded w-32" style={{ background: 'var(--gb-bg-muted)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : newFans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {newFans.map((newFan) => (
                <div key={newFan.id} className="rounded-xl p-4 hover:shadow-md transition-shadow" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}>
                  <div className="flex items-center gap-3">
                    {newFan.profile_photo ? (
                      <img src={newFan.profile_photo} alt={newFan.username} className="w-12 h-12 rounded-full object-cover" style={{ boxShadow: 'var(--gb-shadow-card)' }} />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
                        {newFan.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{newFan.username}</h3>
                      <p className="text-xs" style={{ color: 'var(--gb-fg-muted)' }}>
                        Joined {new Date(newFan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {newFan.bio && (
                    <p className="mt-3 text-sm line-clamp-2" style={{ color: 'var(--gb-fg-soft)' }}>{newFan.bio}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--gb-fg-muted)' }}>No new fans yet. Be the first to join!</p>
          )}
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>Recent Blogs</h2>
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:gap-3"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              <span>See All</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          {recentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}
                >
                  <div className="aspect-video overflow-hidden" style={{ background: 'var(--gb-bg-muted)' }}>
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gb-accent)' }}>
                        <span className="text-4xl" style={{ color: 'var(--gb-bg)' }}>#</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{blog.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--gb-fg-muted)' }}>
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.views}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {blog.likes_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-6" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-muted)' }}>
              No blogs found.
            </div>
          )}
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>Recent Projects</h2>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:gap-3"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              <span>See All</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/projects"
                  className="group rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}
                >
                  <div className="aspect-video overflow-hidden" style={{ background: 'var(--gb-bg-muted)' }}>
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gb-primary)' }}>
                        <span className="text-4xl" style={{ color: 'var(--gb-bg)' }}>=</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{project.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-6" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-muted)' }}>
              No projects found.
            </div>
          )}
        </div>
      </section>

      {/* Core Skills Section */}
      {(coreSkills.length > 0 || showAdminFeatures) && (
        <section className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 relative overflow-hidden" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}>
          <div className="relative space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: 'var(--gb-fg)' }}>Core Skills</h2>
              {showAdminFeatures && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSkill}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                    style={{ background: 'var(--gb-fg)', color: 'var(--gb-bg)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Skill
                  </button>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--gb-bg)', color: 'var(--gb-fg-muted)', boxShadow: 'var(--gb-shadow-soft)' }}>
                    Drag to reorder
                  </span>
                </div>
              )}
            </div>

            {coreSkills.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
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
              <div className="rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg)' }}>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--gb-fg-muted)', color: 'var(--gb-bg)' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--gb-fg)' }}>No Core Skills Yet</h3>
                <p style={{ color: 'var(--gb-fg-muted)' }}>Click "Add Skill" above to showcase your expertise!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Career Path Section */}
      <section className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>Career Path</h2>
          {showAdminFeatures && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-primary)', boxShadow: 'var(--gb-shadow-soft)' }}>Drag to reprioritise (admin)</span>
          )}
        </div>
        <ExperienceCard experience={experience} setExperience={setExperience} />
      </section>

      {/* Add/Edit Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" style={{ background: 'var(--gb-overlay)' }} onClick={() => setShowSkillModal(false)}>
          <div className="relative w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--gb-bg)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>{editingSkill ? "Edit Skill" : "Add New Skill"}</h3>
              <button
                onClick={() => setShowSkillModal(false)}
                className="rounded-full p-2 transition-colors"
                style={{ color: 'var(--gb-fg-muted)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="skill-name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--gb-fg-soft)' }}>
                  Skill Name *
                </label>
                <input
                  id="skill-name"
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., React, TypeScript, Leadership"
                  className="w-full rounded-lg px-4 py-3 text-sm transition-colors"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gb-fg-soft)' }}>Bullet Points</label>
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
                        className="flex-1 rounded-lg px-4 py-2 text-sm transition-colors"
                        style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                      />
                      <button
                        onClick={() => setSkillBullets(skillBullets.filter((_, i) => i !== index))}
                        className="rounded-lg p-2 transition-colors"
                        style={{ color: 'var(--gb-error)' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSkillBullets([...skillBullets, ""])}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                    style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-accent)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Bullet Point
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6" style={{ boxShadow: 'inset 0 1px 0 var(--gb-shadow)' }}>
              <button
                onClick={() => setShowSkillModal(false)}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkill}
                disabled={savingSkill || !skillName.trim()}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
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
