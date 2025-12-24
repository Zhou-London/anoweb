import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiJson } from "../../lib/api";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch overall statistics (public)
        const statsData = await apiJson<OverallStats>("/statistics/overall", {
          credentials: "include",
        });
        setOverallStats(statsData);

        // Fetch user-specific data if logged in
        if (user) {
          const userHoursData = await apiJson<{ total_hours: number }>(`/tracking/user-hours`, {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours);

          const streakData = await apiJson<{ streak: number }>("/statistics/streak", {
            credentials: "include",
          });
          setStreak(streakData.streak);

          // Fetch tracking records for logged-in users
          const recordsData = await apiJson<TrackingRecord[]>("/tracking/records", {
            credentials: "include",
          });
          setRecords(recordsData);
        }

        // Fetch chart data
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

  // Guest view - show sign-in/sign-up buttons
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Community Activity</h1>
          <p className="text-lg text-slate-600 mb-8">
            Join our community to track your journey and see personalized statistics!
          </p>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Link
            to="/account?tab=login"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>
          <Link
            to="/account?tab=register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create Account
          </Link>
        </div>

        {/* Public Statistics */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading community stats...</p>
          </div>
        ) : overallStats && (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon="👥"
                title="Total Members"
                value={overallStats.total_users}
                subtitle="Registered users"
                color="blue"
              />
              <StatCard
                icon="🌍"
                title="All-Time Visitors"
                value={overallStats.unique_visitors_ever}
                subtitle="Unique sessions"
                color="green"
              />
              <StatCard
                icon="⏱️"
                title="Total Time Spent"
                value={`${formatHours(overallStats.total_hours)}h`}
                subtitle="Community engagement"
                color="purple"
              />
              <StatCard
                icon="🔥"
                title="Active Today"
                value={overallStats.active_users_today}
                subtitle="Visitors today"
                color="orange"
              />
            </div>

            {/* 24-Hour Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon="📊"
                title="Last 24 Hours"
                value={overallStats.unique_visitors_24h}
                subtitle="Total visitors"
                color="indigo"
              />
              <StatCard
                icon="👤"
                title="Members (24h)"
                value={overallStats.registered_visitors_24h}
                subtitle="Logged-in users"
                color="cyan"
              />
              <StatCard
                icon="👻"
                title="Guests (24h)"
                value={overallStats.guest_visitors_24h}
                subtitle="Anonymous visitors"
                color="slate"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Visitors Over Time (48h)"
                data={usersOverTime}
                xKey="hour"
                color="blue"
              />
              <ChartCard
                title="Daily Active Users (14 days)"
                data={dailyActive}
                xKey="date"
                color="purple"
              />
            </div>

            {/* Call to Action */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                🚀 Ready to Join the Community?
              </h2>
              <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
                Create an account to unlock personalized tracking, view your streak, and see detailed statistics about your journey with us!
              </p>
              <Link
                to="/account?tab=register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {showAdminFeatures ? "Community Dashboard" : "Your Activity"}
        </h1>
        <p className="text-lg text-slate-600">
          {showAdminFeatures 
            ? "Complete overview of community engagement and statistics"
            : "Track your journey and engagement with our platform"}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading your activity...</p>
        </div>
      ) : (
        <>
          {/* Personal Stats (Always visible for logged-in users) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon="⏱️"
              title="Your Total Time"
              value={`${formatHours(userHours)}h`}
              subtitle="Time on platform"
              color="blue"
            />
            <StatCard
              icon="🔥"
              title="Current Streak"
              value={streak}
              subtitle={`${streak === 0 ? "Start your streak today!" : streak === 1 ? "day" : "days"} consecutive`}
              color="orange"
            />
            <StatCard
              icon="📈"
              title="Sessions"
              value={records.length}
              subtitle="Total visits"
              color="green"
            />
          </div>

          {/* Community Statistics (Visible to all authenticated users) */}
          {overallStats && (
            <>
              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>🌍</span> Community Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MiniStatCard label="Total Members" value={overallStats.total_users} />
                  <MiniStatCard label="All Visitors" value={overallStats.unique_visitors_ever} />
                  <MiniStatCard label="Total Hours" value={`${formatHours(overallStats.total_hours)}h`} />
                  <MiniStatCard label="Active Today" value={overallStats.active_users_today} />
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>📊</span> Last 24 Hours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MiniStatCard label="Total Visitors" value={overallStats.unique_visitors_24h} />
                  <MiniStatCard label="Members" value={overallStats.registered_visitors_24h} />
                  <MiniStatCard label="Guests" value={overallStats.guest_visitors_24h} />
                </div>
              </div>
            </>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Visitors Over Time (48h)"
              data={usersOverTime}
              xKey="hour"
              color="blue"
            />
            <ChartCard
              title="Daily Active Users (14 days)"
              data={dailyActive}
              xKey="date"
              color="purple"
            />
          </div>

          {/* Session History */}
          <div className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 p-6 md:p-8">
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
                      <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDate(record.start_time)}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {record.end_time ? formatDate(record.end_time) : "Active"}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDuration(record.duration)}</td>
                        {showAdminFeatures && (
                          <>
                            <td className="py-3 px-4 text-sm text-slate-700">{record.user_id || "Guest"}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 font-mono text-xs">
                              {record.session_id.substring(0, 8)}...
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Stat Card Component
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
    <div className={`rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

// Mini Stat Card Component
interface MiniStatCardProps {
  label: string;
  value: string | number;
}

function MiniStatCard({ label, value }: MiniStatCardProps) {
  return (
    <div className="bg-white/80 rounded-xl p-4 border border-slate-200">
      <div className="text-xs font-medium text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

// Chart Card Component
interface ChartCardProps {
  title: string;
  data: TimePoint[];
  xKey: "hour" | "date";
  color: "blue" | "purple";
}

function ChartCard({ title, data, xKey, color }: ChartCardProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="rounded-3xl bg-white/80 shadow-lg border border-slate-200/80 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No data available yet</p>
      ) : (
        <div className="space-y-2">
          {data.map((point, idx) => {
            const label = xKey === "hour" 
              ? new Date(point.hour!).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' })
              : new Date(point.date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const percentage = (point.count / maxCount) * 100;
            
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs text-slate-600 w-24 flex-shrink-0">{label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`${colorClasses[color]} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
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
