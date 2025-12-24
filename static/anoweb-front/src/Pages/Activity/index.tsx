import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
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

export default function Activity() {
  const { user, isAdmin } = useContext(UserContext);
  const notifyError = useErrorNotifier();
  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [userHours, setUserHours] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch total hours (public)
        const totalData = await apiJson<{ total_hours: number }>("/tracking/total-hours", {
          credentials: "include",
        });
        setTotalHours(totalData.total_hours);

        // Fetch user hours if authenticated
        if (user) {
          const userHoursData = await apiJson<{ total_hours: number }>("/tracking/user-hours", {
            credentials: "include",
          });
          setUserHours(userHoursData.total_hours);

          // Fetch tracking records
          const recordsData = await apiJson<TrackingRecord[]>("/tracking/records", {
            credentials: "include",
          });
          setRecords(recordsData);
        }
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Failed to load activity data");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading activity data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-slate-200 shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white grid place-items-center text-2xl font-bold shadow-md">
              🌍
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{totalHours.toFixed(2)}h</h2>
              <p className="text-sm text-slate-700 mt-1">Spent by all users on this web</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-slate-200 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white grid place-items-center text-2xl font-bold shadow-md">
                ⏱️
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{userHours.toFixed(2)}h</h2>
                <p className="text-sm text-slate-700 mt-1">Spent by you on this web</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Records */}
      {user && records.length > 0 && (
        <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {isAdmin ? "All Activity" : "Your Activity"}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">Session History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                    Start Time
                  </th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                    End Time
                  </th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                    Duration
                  </th>
                  {isAdmin && (
                    <th className="pb-3 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                      User ID
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-sm text-slate-700">{formatDate(record.start_time)}</td>
                    <td className="py-3 text-sm text-slate-700">
                      {record.end_time ? formatDate(record.end_time) : "Active"}
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-900">
                      {formatDuration(record.duration)}
                    </td>
                    {isAdmin && (
                      <td className="py-3 text-sm text-slate-600">
                        {record.user_id ? `#${record.user_id}` : "Guest"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-slate-900 mt-2">How it works</h2>
        <p className="text-slate-700 leading-relaxed mt-4">
          We track the time you spend on this website!
        </p>
      </section>
    </div>
  );
}
