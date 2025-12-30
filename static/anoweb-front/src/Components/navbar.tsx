// src/components/Navbar.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "../Contexts/user_context";
import { useErrorNotifier } from "../Contexts/error_context";
import { apiFetch } from "../lib/api";
import AuthModal from "./auth_modal";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, refreshUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const location = useLocation();
  const navigate = useNavigate();
  const notifyError = useErrorNotifier();
  const navLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Activity", to: "/activity" },
      { label: "Projects", to: "/projects" },
    ],
    []
  );

  // Wrap BOTH the toggle button and the dropdown in one ref
  const menuWrapRef = useRef<HTMLDivElement | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    setAccountDropdownOpen(false);
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

  // Close account dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!accountDropdownOpen) return;
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [accountDropdownOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST", credentials: "include" });
      await refreshUser();
      setAccountDropdownOpen(false);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to log out");
    }
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setAccountDropdownOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const NavLinkItem = ({ to, label }: { to: string; label: string }) => {
    const active = isActivePath(to);

    return (
      <motion.div className="relative" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        {active && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-full bg-white shadow-sm border border-slate-200"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <Link
          to={to}
          className={`relative z-10 px-3 py-1.5 text-sm font-semibold transition-colors ${
            active ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
          }`}
        >
          {label}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
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
                <span className="text-sm font-semibold text-slate-700">Portfolio</span>
                <span className="-mt-0.5">zhouzhouzhang.co.uk</span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-3">
              <div className="relative flex items-center gap-2 rounded-full bg-slate-50/80 px-2 py-1 border border-slate-200 shadow-inner">
                {navLinks.map((link) => (
                  <NavLinkItem key={link.to} to={link.to} label={link.label} />
                ))}
              </div>

              {/* Account Dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 rounded-full hover:bg-slate-100 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  aria-label="Account menu"
                >
                  {isAuthenticated && user?.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-bold">
                      {isAuthenticated && user ? user.username.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Admin
                    </span>
                  )}
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/account");
                            setAccountDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Account Details
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openAuthModal("login")}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Log In
                        </button>
                        <button
                          onClick={() => openAuthModal("register")}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
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
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                to="/activity"
                className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Activity
              </Link>
              <Link
                to="/projects"
                className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Projects
              </Link>

              <div className="border-t border-slate-200 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setOpen(false)}
                    >
                      Account Details
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 text-rose-700 hover:bg-rose-50"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openAuthModal("login");
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openAuthModal("register");
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
    </>
  );
}
