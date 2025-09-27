// src/components/Navbar.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AdminContext } from "../Contexts/admin_context";

export default function Navbar() {
  const { isAdmin, setIsAdmin } = useContext(AdminContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();

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

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Admin validated!");
        setIsAdmin(true);
      } else {
        alert("Invalid password");
        setIsAdmin(false);
      }
    } catch (err) {
      alert("Error contacting server");
      console.error(err);
      setIsAdmin(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-md">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="h-14 md:h-16 flex items-center justify-between gap-3">
          {/* Brand (external) */}
          <a
            href="https://zhouzhouzhang.co.uk/"
            className="shrink-0 text-base md:text-lg font-extrabold tracking-tight text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            rel="noopener noreferrer"
          >
            zhouzhouzhang.co.uk
          </a>

          {/* Right side (wrap toggle + menu in one ref for reliable outside-click) */}
          <div className="flex items-center gap-2" ref={menuWrapRef}>
            {/* Inline nav (md+) */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
              <Link to="/projects" className="text-gray-700 hover:text-blue-600 font-medium">
                Projects
              </Link>
              <button
                onClick={handleAdminLogin}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Admin
              </button>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> Admin Mode
                </span>
              )}
            </div>

            {/* Compact admin badge on mobile */}
            {isAdmin && (
              <span className="md:hidden inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Admin
              </span>
            )}

            {/* Hamburger (sm only) */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Mobile dropdown (inside the same wrapper) */}
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden transition-[max-height,opacity] duration-200 ease-out overflow-hidden ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
        // Put the dropdown inside the same wrapper visually (CSS-wise it follows nav)
      >
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-2 shadow-sm">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-sm font-semibold text-gray-700">Menu</span>
              {/* Explicit close button for clarity */}
              <button
                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                handleAdminLogin();
              }}
              className="block w-full text-left rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
