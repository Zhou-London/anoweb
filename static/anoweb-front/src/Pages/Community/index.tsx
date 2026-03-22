import { useContext, useEffect, useMemo, useState } from "react";
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

        // Always fetch community fans (public endpoint)
        const fansData = await apiJson<any[]>("/user/list", {
          credentials: "include",
        });
        setCommunityFans(fansData ?? []);

        // Only fetch personal data when logged in
        if (fan) {
          const userHoursData = await apiJson<{ total_hours: number }>(`/tracking/user-hours`, {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours ?? 0);

          const streakData = await apiJson<{ streak: number }>("/statistics/streak", {
            credentials: "include",
          });
          setStreak(streakData.streak ?? 0);

          const recordsData = await apiJson<TrackingRecord[]>("/tracking/records", {
            credentials: "include",
          });
          setRecords(recordsData ?? []);
        }

        const fansOverTimeData = await apiJson<TimePoint[] | null>("/statistics/users-over-time?hours=48", {
          credentials: "include",
        });
        setFansOverTime(fansOverTimeData ?? []);

        const dailyActiveData = await apiJson<TimePoint[] | null>("/statistics/daily-active?days=14", {
          credentials: "include",
        });
        setDailyActive(dailyActiveData ?? []);
      } catch (error) {
        notifyError(error, "Failed to load activity data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fan, notifyError]);

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const communityStats = useMemo(
    () =>
      overallStats
        ? [
            {
              icon: "Users",
              title: "Total Members",
              value: overallStats.total_users,
              subtitle: "Registered fans",
              color: "primary" as const,
            },
            {
              icon: "Globe",
              title: "All-Time Visitors",
              value: overallStats.unique_visitors_ever,
              subtitle: "Unique sessions",
              color: "success" as const,
            },
            {
              icon: "Clock",
              title: "Total Time Spent",
              value: `${formatHours(overallStats.total_hours)}h`,
              subtitle: "Community engagement",
              color: "accent" as const,
            },
            {
              icon: "Fire",
              title: "Active Today",
              value: overallStats.active_users_today,
              subtitle: "Visitors today",
              color: "warning" as const,
            },
          ]
        : [],
    [overallStats]
  );

  const personalHighlights = useMemo(
    () => [
      {
        icon: "Clock",
        title: "Your Total Time",
        value: `${formatHours(userHours)}h`,
        subtitle: "Time on platform",
        color: "primary" as const,
      },
      {
        icon: "Fire",
        title: "Current Streak",
        value: streak,
        subtitle: `${streak === 0 ? "Start your streak today!" : streak === 1 ? "day" : "days"} consecutive`,
        color: "warning" as const,
      },
      {
        icon: "Chart",
        title: "Sessions",
        value: records.length,
        subtitle: "Total visits",
        color: "success" as const,
      },
      {
        icon: "Globe",
        title: "Active Today",
        value: overallStats ? overallStats.active_users_today : 0,
        subtitle: "Community pulse",
        color: "accent" as const,
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

  return (
    <motion.div
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: defaultEase }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--gb-fg)' }}>
          COMMUNITY
        </h1>
      </div>

      {/* Guest CTA */}
      {!fan && (
        <motion.div
          className="rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-xl p-4 sm:p-8 text-center"
          style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
          variants={itemVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--gb-fg)' }}>Join the Community</h2>
          <p className="text-sm sm:text-lg mb-4 sm:mb-6" style={{ color: 'var(--gb-fg-soft)' }}>Sign in to track your personal stats and streaks.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </motion.button>
            <motion.button
              onClick={() => openAuthModal("register")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg"
              style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Fellow Fans - always visible */}
      <motion.div
        className="rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-lg p-4 sm:p-6"
        style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
        variants={itemVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: defaultEase }}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--gb-fg)' }}>Fellow Fans</h2>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  type="search"
                  placeholder="Search fans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 rounded-xl px-4 py-2 text-sm focus:outline-none"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
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
              className="p-2 rounded-xl transition-colors"
              style={{
                background: searchOpen ? 'var(--gb-primary)' : 'var(--gb-bg-soft)',
                color: searchOpen ? 'var(--gb-bg)' : 'var(--gb-fg-soft)'
              }}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredFans.map((fanItem) => (
            <motion.div
              key={fanItem.id}
              className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 cursor-pointer transition-colors"
              style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.15, ease: defaultEase }}
            >
              {fanItem.profile_photo ? (
                <img src={fanItem.profile_photo} alt={fanItem.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
                  {fanItem.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate text-sm" style={{ color: 'var(--gb-fg)' }}>{fanItem.username}</h3>
                <p className="text-xs truncate" style={{ color: 'var(--gb-fg-muted)' }}>
                  {fanItem.bio || `Joined ${new Date(fanItem.created_at).toLocaleDateString()}`}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredFans.length === 0 && !loading && (
          <p className="text-center py-6 text-sm" style={{ color: 'var(--gb-fg-muted)' }}>No fans found matching your search.</p>
        )}
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12" style={{ borderBottom: '2px solid var(--gb-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--gb-fg-soft)' }}>Loading community stats...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Personal Hero Card - only for logged-in users */}
          {fan && (
            <motion.div
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl flex flex-col gap-4 sm:gap-6"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
                <div>
                  <p className="text-xs sm:text-sm font-semibold opacity-80">Today&apos;s snapshot</p>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">Keep the momentum going</h2>
                </div>
                <motion.div
                  className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}
                  whileHover={{ scale: 1.05 }}
                >
                  {records.length} sessions logged
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
                  <p className="text-xs sm:text-sm opacity-70 mb-1">Your Total Time</p>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">{formatHours(userHours)}h</div>
                </div>
                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
                  <p className="text-xs sm:text-sm opacity-70 mb-1">Current Streak</p>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-1 sm:gap-2">
                    {streak}
                    <span className="text-sm sm:text-base font-semibold opacity-80">{streak === 1 ? "day" : "days"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            className="rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-lg p-3 sm:p-4"
            style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3" variants={containerVariants} initial="hidden" animate="show">
              {(fan ? personalHighlights : communityStats).map((stat) => (
                <motion.div key={stat.title} variants={itemVariants} whileHover={{ y: -3, scale: 1.01 }}>
                  <StatCard icon={stat.icon} title={stat.title} value={stat.value} subtitle={stat.subtitle} color={stat.color} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ y: -4 }}
            >
              <ChartCard title="Visitors Over Time (48h)" data={fansOverTime} xKey="hour" color="primary" />
            </motion.div>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ y: -4 }}
            >
              <ChartCard title="Daily Active Users (14 days)" data={dailyActive} xKey="date" color="accent" />
            </motion.div>
          </div>

          {/* Community Highlights */}
          {overallStats && (
            <motion.div
              className="rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4"
              style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
              variants={itemVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--gb-fg)' }}>
                  Community Highlights
                </h2>
                <span className="rounded-full text-xs font-semibold px-2 sm:px-3 py-1" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-primary)', boxShadow: 'var(--gb-shadow-card)' }}>
                  Live overview
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {communitySnapshot.map((stat) => (
                  <MiniStatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </motion.div>
          )}
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
  color: "primary" | "success" | "accent" | "warning";
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorMap = {
    primary: { bg: 'var(--gb-bg-soft)', border: 'var(--gb-primary)', text: 'var(--gb-primary)' },
    success: { bg: 'var(--gb-bg-soft)', border: 'var(--gb-success)', text: 'var(--gb-success)' },
    accent: { bg: 'var(--gb-bg-soft)', border: 'var(--gb-accent)', text: 'var(--gb-accent)' },
    warning: { bg: 'var(--gb-bg-soft)', border: 'var(--gb-warning)', text: 'var(--gb-warning)' },
  };

  const colors = colorMap[color];

  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: colors.bg, boxShadow: 'var(--gb-shadow-card)' }}
    >
      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{icon === "Users" ? "👥" : icon === "Globe" ? "🌍" : icon === "Clock" ? "⏱️" : icon === "Fire" ? "🔥" : icon === "Chart" ? "📈" : "📊"}</div>
      <div className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: 'var(--gb-fg-soft)' }}>{title}</div>
      <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: colors.text }}>{value}</div>
      <div className="text-[10px] sm:text-xs" style={{ color: 'var(--gb-fg-muted)' }}>{subtitle}</div>
    </div>
  );
}

interface MiniStatCardProps {
  label: string;
  value: string | number;
}

function MiniStatCard({ label, value }: MiniStatCardProps) {
  return (
    <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }}>
      <div className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: 'var(--gb-fg-soft)' }}>{label}</div>
      <div className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>{value}</div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: TimePoint[];
  xKey: "hour" | "date";
  color: "primary" | "accent";
}

function ChartCard({ title, data, xKey, color }: ChartCardProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barColor = color === "primary" ? 'var(--gb-primary)' : 'var(--gb-accent)';

  return (
    <div className="rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-lg p-4 sm:p-6 h-full" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--gb-fg)' }}>
        <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full" style={{ background: barColor }} aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="text-center py-6 sm:py-8 text-sm" style={{ color: 'var(--gb-fg-muted)' }}>No data available yet</p>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {data.map((point, idx) => {
            const label = xKey === "hour"
              ? new Date(point.hour!).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" })
              : new Date(point.date!).toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const percentage = (point.count / maxCount) * 100;

            return (
              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                <div className="text-[10px] sm:text-xs w-16 sm:w-24 flex-shrink-0 truncate" style={{ color: 'var(--gb-fg-soft)' }}>{label}</div>
                <div className="flex-1 rounded-full h-4 sm:h-6 relative overflow-hidden" style={{ background: 'var(--gb-bg-soft)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: barColor }} />
                </div>
                <div className="text-xs sm:text-sm font-semibold w-8 sm:w-12 text-right" style={{ color: 'var(--gb-fg-soft)' }}>{point.count}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
