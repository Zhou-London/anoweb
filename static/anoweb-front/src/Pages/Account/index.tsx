import { useContext, useState, useRef, useEffect } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
import { apiFetch, apiJson } from "../../lib/api";
import { useNavigate } from "react-router";

interface TrackingRecord {
  id: number;
  user_id?: number;
  session_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  created_at: string;
}

export default function AccountPage() {
  const { fan, refreshFan } = useContext(FanContext);
  const notifyError = useErrorNotifier();
  const notifySuccess = useSuccessNotifier();
  const navigate = useNavigate();
  const [bio, setBio] = useState(fan?.bio || "");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiJson<TrackingRecord[]>("/tracking/records", {
          credentials: "include",
        });
        setRecords(data);
      } catch (err) {
        console.error("Failed to load tracking records:", err);
      }
    };
    fetchRecords();
  }, []);

  if (!fan) {
    navigate("/");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
        credentials: "include",
      });
      await refreshFan();
      notifySuccess("Profile updated successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await apiFetch("/user/profile/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      await refreshFan();
      notifySuccess("Profile photo updated successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {fan.profile_photo ? (
                  <img
                    src={fan.profile_photo}
                    alt={fan.username}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {fan.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={fan.username}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={fan.email}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Bio Section */}
          <form onSubmit={handleUpdateProfile}>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Mystery Code Section */}
          {!fan.is_admin && (
            <div className="mt-6 p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Unlock Admin Access</h3>
              <p className="text-sm text-slate-600 mb-4">
                Have a mystery code? Enter it below to gain administrator privileges.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const code = formData.get("mystery_code") as string;
                  if (!code) return;

                  setLoading(true);
                  try {
                    await apiFetch("/mystery-code/verify", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code }),
                      credentials: "include",
                    });
                    await refreshFan();
                    notifySuccess("Admin privileges granted! Please refresh the page.");
                    e.currentTarget.reset();
                  } catch (err) {
                    notifyError(err instanceof Error ? err.message : "Invalid mystery code");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="mystery_code"
                  placeholder="Enter mystery code"
                  className="flex-1 px-3 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>
            </div>
          )}

          {/* Admin Badge */}
          {fan.is_admin && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin
                </span>
                <span className="text-sm text-slate-600">You have administrator privileges</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
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
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-sm text-slate-700">{formatDate(record.start_time)}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{record.end_time ? formatDate(record.end_time) : "Active"}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{formatDuration(record.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
