import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FanContext } from "../Contexts/fan_context";
import { useErrorNotifier } from "../Contexts/error_context";
import { apiJson, apiFetch, getErrorMessage } from "../lib/api";
import AnnouncementPopup from "./announcement_popup";
import MDEditor from "@uiw/react-md-editor";

interface Announcement {
  id: number;
  title: string;
  content_md: string;
  image_url: string;
  created_at: string;
}

export default function NotificationBell() {
  const { isAdmin } = useContext(FanContext);
  const notifyError = useErrorNotifier();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Admin create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiJson<{ announcements: Announcement[] }>("/announcement", {
        credentials: "include",
      });
      setAnnouncements(res.announcements ?? []);
      const lastReadId = parseInt(localStorage.getItem("announcement_last_read_id") || "0", 10);
      const latest = res.announcements?.[0];
      setHasUnread(!!latest && latest.id > lastReadId);
    } catch {
      // no announcements
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!panelOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [panelOpen]);

  const handleOpenAnnouncement = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setPanelOpen(false);
    // Mark as read
    const lastReadId = parseInt(localStorage.getItem("announcement_last_read_id") || "0", 10);
    if (a.id > lastReadId) {
      localStorage.setItem("announcement_last_read_id", String(a.id));
      setHasUnread(false);
    }
  };

  const handleBellClick = () => {
    setPanelOpen(!panelOpen);
    if (!panelOpen && hasUnread && announcements.length > 0) {
      const latest = announcements[0];
      const lastReadId = parseInt(localStorage.getItem("announcement_last_read_id") || "0", 10);
      if (latest.id > lastReadId) {
        localStorage.setItem("announcement_last_read_id", String(latest.id));
        setHasUnread(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      notifyError("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      let imgUrl = newImageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await apiFetch("/static/upload-image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        imgUrl = await uploadRes.text();
      }

      await apiFetch("/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle.trim(),
          content_md: newContent.trim(),
          image_url: imgUrl,
        }),
      });

      setNewTitle("");
      setNewContent("");
      setNewImageUrl("");
      setImageFile(null);
      setImagePreview("");
      setShowCreateForm(false);
      await fetchAnnouncements();
    } catch (err) {
      notifyError(getErrorMessage(err, "Failed to create announcement"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiFetch(`/announcement/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchAnnouncements();
    } catch (err) {
      notifyError(getErrorMessage(err, "Failed to delete announcement"));
    }
  };

  return (
    <>
      <div className="relative" ref={panelRef}>
        <button
          onClick={handleBellClick}
          className="relative rounded-full p-2 transition-colors"
          style={{ color: 'var(--gb-fg-soft)' }}
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {hasUnread && (
            <span
              className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full"
              style={{ background: 'var(--gb-error)' }}
            />
          )}
        </button>

        {panelOpen && (
          <div
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl py-2 max-h-[70vh] overflow-y-auto"
            style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card-hover)' }}
          >
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--gb-fg)' }}>Announcements</h3>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
                >
                  {showCreateForm ? "Cancel" : "+ New"}
                </button>
              )}
            </div>

            {/* Admin Create Form */}
            {isAdmin && showCreateForm && (
              <div className="px-4 py-3 space-y-3" style={{ borderBottom: '1px solid var(--gb-border)' }}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                />
                <div data-color-mode="light">
                  <MDEditor
                    value={newContent}
                    onChange={(val) => setNewContent(val || "")}
                    height={150}
                    preview="edit"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <label className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-accent)' }}>
                    {imageFile ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newTitle.trim() || !newContent.trim()}
                  className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
                >
                  {saving ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            )}

            {/* Announcements List */}
            {announcements.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--gb-fg-muted)' }}>No announcements yet.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--gb-border)' }}>
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="px-4 py-3 cursor-pointer transition-colors hover:opacity-80"
                    style={{ background: 'var(--gb-bg)' }}
                    onClick={() => handleOpenAnnouncement(a)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{a.title}</h4>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--gb-fg-soft)' }}>
                          {a.content_md.replace(/[#*_`~>\[\]()!]/g, "").slice(0, 100)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--gb-fg-muted)' }}>
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {a.image_url && (
                        <img src={a.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                        className="mt-1 text-xs font-semibold"
                        style={{ color: 'var(--gb-error)' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAnnouncement && createPortal(
        <AnnouncementPopup
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />,
        document.body
      )}
    </>
  );
}
