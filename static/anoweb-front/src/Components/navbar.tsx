// src/components/Navbar.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FanContext } from "../Contexts/fan_context";
import { useErrorNotifier } from "../Contexts/error_context";
import { useTheme } from "../Contexts/theme_context";
import { apiFetch } from "../lib/api";
import AuthModal from "./auth_modal";

export default function Navbar() {
  const { fan, isAuthenticated, isAdmin, refreshFan } = useContext(FanContext);
  const { theme, toggleTheme } = useTheme();
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
      { label: "Community", to: "/community" },
      { label: "Blogs", to: "/blogs" },
      { label: "Projects", to: "/projects" },
    ],
    []
  );

  const menuWrapRef = useRef<HTMLDivElement | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

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
      await refreshFan();
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
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <Link
          to={to}
          className="relative z-10 px-3 py-1.5 text-sm font-semibold transition-colors"
          style={{ color: active ? 'var(--gb-fg)' : 'var(--gb-fg-soft)' }}
        >
          {label}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur transition-colors duration-200"
        style={{
          background: theme === 'dark' ? 'rgba(40, 40, 40, 0.85)' : 'rgba(251, 241, 199, 0.85)',
          boxShadow: 'var(--gb-shadow-soft)'
        }}
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6" ref={menuWrapRef}>
          <div className="h-14 md:h-16 flex items-center justify-between gap-3">
            <a
              href="https://zhouzhouzhang.co.uk/"
              className="rounded-lg px-3 py-1.5 text-base font-semibold transition-colors"
              style={{ color: 'var(--gb-fg-soft)' }}
              rel="noopener noreferrer"
            >
              zhouzhouzhang.co.uk
            </a>

            <div className="hidden md:flex items-center gap-3">
              <div
                className="relative flex items-center gap-2 rounded-full px-2 py-1"
                style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)' }}
              >
                {navLinks.map((link) => (
                  <NavLinkItem key={link.to} to={link.to} label={link.label} />
                ))}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-2 transition-colors"
                  aria-label="Account menu"
                >
                  {isAuthenticated && fan?.profile_photo ? (
                    <img
                      src={fan.profile_photo}
                      alt={fan.username}
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ boxShadow: 'var(--gb-shadow-card)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--gb-fg-muted)', color: 'var(--gb-bg)' }}
                    >
                      {isAuthenticated && fan ? fan.username.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  {isAdmin && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gb-bg)' }} /> Admin
                    </span>
                  )}
                </button>

                {accountDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg py-1"
                    style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card-hover)' }}
                  >
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/account");
                            setAccountDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--gb-fg-soft)' }}
                        >
                          Account Details
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--gb-error)' }}
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openAuthModal("login")}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--gb-fg-soft)' }}
                        >
                          Log In
                        </button>
                        <button
                          onClick={() => openAuthModal("register")}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--gb-fg-soft)' }}
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
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                  style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gb-bg)' }} /> Admin
                </span>
              )}
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full p-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
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
            <div
              className="rounded-2xl"
              style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>Quick links</span>
                <button
                  className="inline-flex items-center justify-center rounded-full p-2 transition-colors"
                  style={{ color: 'var(--gb-fg-soft)' }}
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
                className="block rounded-lg px-3 py-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/community"
                className="block rounded-lg px-3 py-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                onClick={() => setOpen(false)}
              >
                Community
              </Link>
              <Link
                to="/blogs"
                className="block rounded-lg px-3 py-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                onClick={() => setOpen(false)}
              >
                Blogs
              </Link>
              <Link
                to="/projects"
                className="block rounded-lg px-3 py-2 transition-colors"
                style={{ color: 'var(--gb-fg-soft)' }}
                onClick={() => setOpen(false)}
              >
                Projects
              </Link>

              <div className="mt-2 pt-2" style={{ boxShadow: 'inset 0 1px 0 var(--gb-shadow)' }}>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="block rounded-lg px-3 py-2 transition-colors"
                      style={{ color: 'var(--gb-fg-soft)' }}
                      onClick={() => setOpen(false)}
                    >
                      Account Details
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 transition-colors"
                      style={{ color: 'var(--gb-error)' }}
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
                      className="block w-full text-left rounded-lg px-3 py-2 transition-colors"
                      style={{ color: 'var(--gb-fg-soft)' }}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openAuthModal("register");
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 transition-colors"
                      style={{ color: 'var(--gb-fg-soft)' }}
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
