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
  const [pageIndex, setPageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiJson<TrackingRecord[]>("/tracking/records", {
          credentials: "include",
        });
        setRecords(data);
        setPageIndex(0);
      } catch (err) {
        console.error("Failed to load tracking records:", err);
      }
    };
    fetchRecords();
  }, []);
  useEffect(() => {
    if (records.length === 0) {
      if (pageIndex !== 0) setPageIndex(0);
      return;
    }
    const maxIndex = Math.max(0, Math.ceil(records.length / pageSize) - 1);
    if (pageIndex > maxIndex) {
      setPageIndex(maxIndex);
    }
  }, [pageIndex, records.length]);

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

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const hasPrevPage = pageIndex > 0;
  const hasNextPage = pageIndex < totalPages - 1;
  const pagedRecords = records.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-0">
      <div className="rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--gb-fg)' }}>Account Settings</h1>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Photo Section */}
          <div>
            <label className="block text-sm font-medium mb-2 sm:mb-3" style={{ color: 'var(--gb-fg-soft)' }}>Profile Photo</label>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                {fan.profile_photo ? (
                  <img
                    src={fan.profile_photo}
                    alt={fan.username}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                    style={{ boxShadow: 'var(--gb-shadow-card)' }}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
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
                  className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
                >
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--gb-fg-soft)' }}>Username</label>
            <input
              type="text"
              value={fan.username}
              disabled
              className="w-full px-3 py-2 rounded-lg cursor-not-allowed"
              style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg-muted)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--gb-fg-soft)' }}>Email</label>
            <input
              type="email"
              value={fan.email}
              disabled
              className="w-full px-3 py-2 rounded-lg cursor-not-allowed"
              style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg-muted)' }}
            />
          </div>

          {/* Bio Section */}
          <form onSubmit={handleUpdateProfile}>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1" style={{ color: 'var(--gb-fg-soft)' }}>
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg resize-none focus:outline-none"
                style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Mystery Code Section */}
          {!fan.is_admin && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-lg" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style={{ color: 'var(--gb-fg)' }}>Unlock Admin Access</h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--gb-fg-soft)' }}>
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
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  name="mystery_code"
                  placeholder="Enter mystery code"
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>
            </div>
          )}

          {/* Admin Badge */}
          {fan.is_admin && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--gb-bg)' }} /> Admin
                </span>
                <span className="text-sm" style={{ color: 'var(--gb-fg-soft)' }}>You have administrator privileges</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2" style={{ color: 'var(--gb-fg)' }}>
          Your Session History
        </h2>
        {records.length === 0 ? (
          <p className="text-center py-6 sm:py-8 text-sm" style={{ color: 'var(--gb-fg-soft)' }}>No session records yet. Keep exploring!</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr style={{ boxShadow: 'inset 0 -1px 0 var(--gb-shadow)' }}>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>Start Time</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>End Time</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRecords.map((record) => (
                    <tr key={record.id} className="hover:opacity-80" style={{ boxShadow: 'inset 0 -1px 0 var(--gb-shadow-soft)' }}>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm" style={{ color: 'var(--gb-fg-soft)' }}>{formatDate(record.start_time)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm" style={{ color: 'var(--gb-fg-soft)' }}>
                        {record.end_time ? formatDate(record.end_time) : "Active"}
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm" style={{ color: 'var(--gb-fg-soft)' }}>{formatDuration(record.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={!hasPrevPage}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ boxShadow: 'var(--gb-shadow-soft)', color: 'var(--gb-fg-soft)' }}
                aria-label="Previous page"
              >
                <span aria-hidden="true">←</span>
                Prev
              </button>
              <span className="text-sm font-medium" style={{ color: 'var(--gb-fg-muted)' }}>
                Page {pageIndex + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={!hasNextPage}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ boxShadow: 'var(--gb-shadow-soft)', color: 'var(--gb-fg-soft)' }}
                aria-label="Next page"
              >
                Next
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
