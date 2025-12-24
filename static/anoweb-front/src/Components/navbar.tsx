// src/components/Navbar.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AdminContext } from "../Contexts/admin_context";
import { useErrorNotifier } from "../Contexts/error_context";
import { apiFetch } from "../lib/api";

export default function Navbar() {
  const { isAdmin, setIsAdmin } = useContext(AdminContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const notifyError = useErrorNotifier();

  // Wrap BOTH the toggle button and the dropdown in one ref
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleAdminLogin = async () => {
    const pass = prompt("Enter admin password:");
    if (!pass) return;

    apiFetch("/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass }),
      credentials: "include",
    })
      .then(() => {
        setIsAdmin(true);
      })
      .catch(() => {
        notifyError("Invalid password or server unreachable");
        setIsAdmin(false);
      });
  };

  const handleAdminLogout = async () => {
    try {
      await apiFetch("/admin/logout", { method: "POST", credentials: "include" });
      setIsAdmin(false);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to log out");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200/80 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6" ref={menuWrapRef}>
        <div className="h-14 md:h-16 flex items-center justify-between gap-3">
          <a
            href="https://zhouzhouzhang.co.uk/"
            className="flex items-center gap-3 rounded-full px-3 py-1 text-base md:text-lg font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            rel="noopener noreferrer"
          >
            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white font-bold grid place-items-center shadow-sm">
              Z
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] uppercase tracking-[0.18em] text-slate-500">Portfolio</span>
              <span className="-mt-0.5">zhouzhouzhang.co.uk</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-50/80 px-2 py-1 border border-slate-200">
            <Link to="/" className="nav-chip">
              Home
            </Link>
            <Link to="/about" className="nav-chip">
              About
            </Link>
            <Link to="/projects" className="nav-chip">
              Projects
            </Link>
            <button onClick={handleAdminLogin} className="nav-chip text-blue-700">
              Admin
            </button>
            {isAdmin && (
              <button onClick={handleAdminLogout} className="nav-chip text-rose-700">
                Log out
              </button>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Admin
              </span>
            )}
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {open ? (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden transition-[max-height,opacity] duration-200 ease-out overflow-hidden ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Quick links</span>
              <button
                className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              to="/projects"
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Projects
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                handleAdminLogin();
              }}
              className="block w-full text-left rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Admin
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  handleAdminLogout();
                }}
                className="block w-full text-left rounded-lg px-3 py-2 text-rose-700 hover:bg-rose-50"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
