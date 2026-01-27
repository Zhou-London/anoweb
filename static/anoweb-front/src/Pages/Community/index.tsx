import { useContext, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
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

export default function Community() {
  const { fan } = useContext(FanContext);
  const notifyError = useErrorNotifier();

  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHours, setUserHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [fansOverTime, setFansOverTime] = useState<TimePoint[]>([]);
  const [dailyActive, setDailyActive] = useState<TimePoint[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [communityFans, setCommunityFans] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const openAuthModal = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const filteredFans = useMemo(() => {
    return communityFans.filter((fan) =>
      fan.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fan.bio && fan.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [communityFans, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const statsData = await apiJson<OverallStats>("/statistics/overall", {
          credentials: "include",
        });
        setOverallStats(statsData);

        if (fan) {
          const fansData = await apiJson<any[]>("/user/list", {
            credentials: "include",
          });
          setCommunityFans(fansData);
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

        const fansOverTimeData = await apiJson<TimePoint[]>("/statistics/users-over-time?hours=48", {
          credentials: "include",
        });
        setFansOverTime(fansOverTimeData);

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
  }, [fan, notifyError]);

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
              subtitle: "Registered fans",
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

  if (!fan) {
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Join the Community</h1>
          <p className="text-lg text-slate-700 mb-6">And unlock the full access.</p>
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

        {/* Fellow Fans Preview for Guests */}
        <motion.div
          className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg p-6 relative overflow-hidden"
          variants={itemVariants}
          initial="hidden"
          animate="show"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2, ease: defaultEase }}
        >
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-bold text-slate-900">Fellow Fans</h2>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* First 3 placeholders shown normally */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 bg-slate-200 rounded w-20 mb-1.5" />
                  <div className="h-3 bg-slate-100 rounded w-28" />
                </div>
              </div>
            ))}
            {/* Remaining placeholders blurred */}
            <div className="contents blur-sm select-none pointer-events-none">
              {[4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3.5 bg-slate-200 rounded w-20 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
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
                <ChartCard title="Visitors Over Time (48h)" data={fansOverTime} xKey="hour" color="blue" />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <ChartCard title="Daily Active Users (14 days)" data={dailyActive} xKey="date" color="purple" />
              </motion.div>
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Community Dashboard</h1>
      </div>

      {/* Fellow Fans */}
      <motion.div
        className="rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg p-6"
        variants={itemVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: defaultEase }}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold text-slate-900">Fellow Fans</h2>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  type="search"
                  placeholder="Search fans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  initial={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
                  animate={{ width: "auto", opacity: 1, paddingLeft: 16, paddingRight: 16 }}
                  exit={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  autoFocus
                />
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) setSearchQuery("");
              }}
              className={`p-2 rounded-xl transition-colors ${searchOpen ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredFans.map((fanItem) => (
            <motion.div
              key={fanItem.id}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 hover:bg-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.15, ease: defaultEase }}
            >
              {fanItem.profile_photo ? (
                <img src={fanItem.profile_photo} alt={fanItem.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {fanItem.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate text-sm">{fanItem.username}</h3>
                <p className="text-xs text-slate-500 truncate">
                  {fanItem.bio || `Joined ${new Date(fanItem.created_at).toLocaleDateString()}`}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredFans.length === 0 && (
          <p className="text-slate-500 text-center py-6 text-sm">No fans found matching your search.</p>
        )}
      </motion.div>

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
            <ChartCard title="Visitors Over Time (48h)" data={fansOverTime} xKey="hour" color="blue" />
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
