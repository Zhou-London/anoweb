import { useContext, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiJson } from "../../lib/api";
import AuthModal from "../../Components/auth_modal";

interface TrackingRecord {
  id: number;
  user_id?: number;
  session_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  created_at: string;
}

interface OverallStats {
  total_users: number;
  unique_visitors_ever: number;
  unique_visitors_24h: number;
  registered_visitors_ever: number;
  guest_visitors_ever: number;
  registered_visitors_24h: number;
  guest_visitors_24h: number;
  active_users_today: number;
  total_hours: number;
}

interface TimePoint {
  hour?: string;
  date?: string;
  count: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: defaultEase } },
};

export default function Activity() {
  const { user, isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();

  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHours, setUserHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [dailyActive, setDailyActive] = useState<TimePoint[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const openAuthModal = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const statsData = await apiJson<OverallStats>("/statistics/overall", {
          credentials: "include",
        });
        setOverallStats(statsData);

        if (user) {
          const userHoursData = await apiJson<{ total_hours: number }>(`/tracking/user-hours`, {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours);

          const streakData = await apiJson<{ streak: number }>("/statistics/streak", {
            credentials: "include",
          });
          setStreak(streakData.streak);

          const recordsData = await apiJson<TrackingRecord[]>("/tracking/records", {
            credentials: "include",
          });
          setRecords(recordsData);
        }

        const usersOverTimeData = await apiJson<TimePoint[]>("/statistics/users-over-time?hours=48", {
          credentials: "include",
        });
        setUsersOverTime(usersOverTimeData);

        const dailyActiveData = await apiJson<TimePoint[]>("/statistics/daily-active?days=14", {
          credentials: "include",
        });
        setDailyActive(dailyActiveData);
      } catch (error) {
        notifyError("Failed to load activity data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, notifyError]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const guestStats = useMemo(
    () =>
      overallStats
        ? [
            {
              icon: "👥",
              title: "Total Members",
              value: overallStats.total_users,
              subtitle: "Registered users",
              color: "blue" as const,
            },
            {
              icon: "🌍",
              title: "All-Time Visitors",
              value: overallStats.unique_visitors_ever,
              subtitle: "Unique sessions",
              color: "green" as const,
            },
            {
              icon: "⏱️",
              title: "Total Time Spent",
              value: `${formatHours(overallStats.total_hours)}h`,
              subtitle: "Community engagement",
              color: "purple" as const,
            },
            {
              icon: "🔥",
              title: "Active Today",
              value: overallStats.active_users_today,
              subtitle: "Visitors today",
              color: "orange" as const,
            },
          ]
        : [],
    [overallStats]
  );

  const personalHighlights = useMemo(
    () => [
      {
        icon: "⏱️",
        title: "Your Total Time",
        value: `${formatHours(userHours)}h`,
        subtitle: "Time on platform",
        color: "blue" as const,
      },
      {
        icon: "🔥",
        title: "Current Streak",
        value: streak,
        subtitle: `${streak === 0 ? "Start your streak today!" : streak === 1 ? "day" : "days"} consecutive`,
        color: "orange" as const,
      },
      {
        icon: "📈",
        title: "Sessions",
        value: records.length,
        subtitle: "Total visits",
        color: "green" as const,
      },
      {
        icon: "🌍",
        title: "Active Today",
        value: overallStats ? overallStats.active_users_today : 0,
        subtitle: "Community pulse",
        color: "purple" as const,
      },
    ],
    [overallStats, records.length, streak, userHours]
  );

  const communitySnapshot = useMemo(
    () =>
      overallStats
        ? [
            { label: "Total Members", value: overallStats.total_users },
            { label: "All Visitors", value: overallStats.unique_visitors_ever },
            { label: "Total Hours", value: `${formatHours(overallStats.total_hours)}h` },
            { label: "Visitors 24h", value: overallStats.unique_visitors_24h },
            { label: "Members 24h", value: overallStats.registered_visitors_24h },
            { label: "Guests 24h", value: overallStats.guest_visitors_24h },
          ]
        : [],
    [overallStats]
  );

  if (!user) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: defaultEase }}
      >
        <motion.div
          className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-xl p-8 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Community Activity</h1>
          <p className="text-lg text-slate-600 mb-6">Join our community to track your journey and see personalized statistics!</p>
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </motion.button>
            <motion.button
              onClick={() => openAuthModal("register")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading community stats...</p>
          </div>
        ) : (
          <>
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="show">
              {guestStats.map((stat) => (
                <motion.div key={stat.title} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }}>
                  <StatCard icon={stat.icon} title={stat.title} value={stat.value} subtitle={stat.subtitle} color={stat.color} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <ChartCard title="Visitors Over Time (48h)" data={usersOverTime} xKey="hour" color="blue" />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <ChartCard title="Daily Active Users (14 days)" data={dailyActive} xKey="date" color="purple" />
              </motion.div>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md p-8 text-center shadow-xl"
              variants={itemVariants}
              initial="hidden"
              animate="show"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-3">🚀 Ready to Join the Community?</h2>
              <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
                Create an account to unlock personalized tracking, view your streak, and see detailed statistics about your journey with us!
              </p>
              <motion.button
                onClick={() => openAuthModal("register")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </motion.div>
          </>
        )}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
      </motion.div>
    );
  }

  const bentoLayoutStyles: CSSProperties = {
    gridTemplateAreas: `
      "hero hero hero hero chart1 chart1"
      "stats stats stats stats chart1 chart1"
      "community community community chart2 chart2 chart2"
      "history history history history history history"
    `,
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: defaultEase }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{showAdminFeatures ? "Community Dashboard" : "Your Activity"}</h1>
        {showAdminFeatures && <p className="text-lg text-slate-600">Complete overview of community engagement and statistics</p>}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading your activity...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-6" style={bentoLayoutStyles}>
          <motion.div
            className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-xl flex flex-col gap-6"
            style={{ gridArea: "hero" }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-white/80">Today&apos;s snapshot</p>
                <h2 className="text-3xl font-bold mt-2">Keep the momentum going</h2>
              </div>
              <motion.div
                className="rounded-full bg-white/15 border border-white/25 px-4 py-2 text-sm font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                {records.length} sessions logged
              </motion.div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/15 border border-white/20 p-4 shadow-inner">
                <p className="text-sm text-white/70 mb-1">Your Total Time</p>
                <div className="text-3xl font-bold">{formatHours(userHours)}h</div>
              </div>
              <div className="rounded-2xl bg-white/15 border border-white/20 p-4 shadow-inner">
                <p className="text-sm text-white/70 mb-1">Current Streak</p>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {streak}
                  <span className="text-base font-semibold text-white/80">{streak === 1 ? "day" : "days"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg p-4"
            style={{ gridArea: "stats" }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={containerVariants} initial="hidden" animate="show">
              {personalHighlights.map((stat) => (
                <motion.div key={stat.title} variants={itemVariants} whileHover={{ y: -3, scale: 1.01 }}>
                  <StatCard icon={stat.icon} title={stat.title} value={stat.value} subtitle={stat.subtitle} color={stat.color} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {overallStats && (
            <motion.div
              className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg p-6 space-y-4"
              style={{ gridArea: "community" }}
              variants={itemVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>📊</span> Community Highlights
                </h2>
                <span className="rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 border border-blue-100">
                  Live overview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {communitySnapshot.map((stat) => (
                  <MiniStatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            className="md:col-span-3"
            style={{ gridArea: "chart1" }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -4 }}
          >
            <ChartCard title="Visitors Over Time (48h)" data={usersOverTime} xKey="hour" color="blue" />
          </motion.div>
          <motion.div
            className="md:col-span-3"
            style={{ gridArea: "chart2" }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -4 }}
          >
            <ChartCard title="Daily Active Users (14 days)" data={dailyActive} xKey="date" color="purple" />
          </motion.div>

          <motion.div
            className="rounded-3xl bg-white/85 backdrop-blur-md shadow-xl border border-slate-200/90 p-6 md:p-8"
            style={{ gridArea: "history" }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            whileHover={{ y: -3 }}
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span>📝</span> Your Session History
            </h2>
            {records.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No session records yet. Keep exploring!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Start Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">End Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Duration</th>
                      {showAdminFeatures && (
                        <>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Session ID</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDate(record.start_time)}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{record.end_time ? formatDate(record.end_time) : "Active"}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDuration(record.duration)}</td>
                        {showAdminFeatures && (
                          <>
                            <td className="py-3 px-4 text-sm text-slate-700">{record.user_id || "Guest"}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 font-mono text-xs">{record.session_id.substring(0, 8)}...</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
    </motion.div>
  );
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  color: "blue" | "green" | "purple" | "orange" | "indigo" | "cyan" | "slate";
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700",
    cyan: "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700",
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-700",
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs font-medium text-slate-600 mb-1">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-600">{subtitle}</div>
    </div>
  );
}

interface MiniStatCardProps {
  label: string;
  value: string | number;
}

function MiniStatCard({ label, value }: MiniStatCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="text-xs font-medium text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: TimePoint[];
  xKey: "hour" | "date";
  color: "blue" | "purple";
}

function ChartCard({ title, data, xKey, color }: ChartCardProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="rounded-3xl bg-white/85 backdrop-blur-md shadow-lg border border-slate-200/80 p-6 h-full">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No data available yet</p>
      ) : (
        <div className="space-y-2">
          {data.map((point, idx) => {
            const label = xKey === "hour"
              ? new Date(point.hour!).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" })
              : new Date(point.date!).toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const percentage = (point.count / maxCount) * 100;

            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs text-slate-600 w-24 flex-shrink-0">{label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div className={`${colorClasses[color]} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                </div>
                <div className="text-sm font-semibold text-slate-700 w-12 text-right">{point.count}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
