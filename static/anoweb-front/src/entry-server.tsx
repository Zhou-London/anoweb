import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRouter from "./App";
import { ThemeProvider } from "./Contexts/theme_context";
import { ErrorProvider } from "./Contexts/error_context";
import { SuccessProvider } from "./Contexts/success_context";
import { FanProvider } from "./Contexts/fan_context";
import { EditModeProvider } from "./Contexts/edit_mode_context";

// Minimal Navbar for SSR (no notification bell / browser-dependent features)
function SSRNavbar() {
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Community", to: "/community" },
    { label: "Blogs", to: "/blogs" },
    { label: "vBooks", to: "/vbooks" },
    { label: "Projects", to: "/projects" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="h-14 md:h-16 flex items-center justify-between gap-3">
          <a
            href="https://zhouzhouzhang.co.uk/"
            className="rounded-lg px-3 py-1.5 text-base font-semibold transition-colors"
            style={{ color: 'var(--gb-fg-soft)' }}
          >
            zhouzhouzhang.co.uk
          </a>
          <div className="hidden md:flex items-center gap-3">
            <div className="relative flex items-center gap-2 rounded-full px-2 py-1" style={{ background: 'var(--gb-bg-soft)' }}>
              {navLinks.map((link) => (
                <a key={link.to} href={link.to} className="relative z-10 px-3 py-1.5 text-sm font-semibold" style={{ color: 'var(--gb-fg-soft)' }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function SSRFooter() {
  return (
    <footer className="mt-auto py-6 text-center text-xs" style={{ color: "var(--gb-fg-muted)" }}>
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>&copy; {new Date().getFullYear()} Zhouzhou (JoJo) Zhang</span>
        <span className="hidden sm:inline" style={{ color: "var(--gb-fg-faint)" }}>|</span>
        <a href="/privacy" className="transition-colors hover:underline" style={{ color: "var(--gb-fg-muted)" }}>
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}

function SSRApp() {
  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-200" style={{ background: 'var(--gb-bg)', color: 'var(--gb-fg)' }}>
      <div className="relative flex-1">
        <SSRNavbar />
        <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:pt-10 md:px-8">
          <AppRouter />
        </main>
      </div>
      <SSRFooter />
    </div>
  );
}

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Zhouzhou(JoJo) Zhang - Software Engineer",
    description: "Zhouzhou(JoJo) Zhang's personal website. Software engineer, projects, blogs, and community.",
  },
  "/community": {
    title: "Community - Zhouzhou Zhang",
    description: "Join the community. See fellow fans, stats, and activity on Zhouzhou Zhang's website.",
  },
  "/blogs": {
    title: "Blogs - Zhouzhou Zhang",
    description: "Read the latest blog posts by Zhouzhou Zhang on software engineering, tech, and more.",
  },
  "/vbooks": {
    title: "vBooks - Zhouzhou Zhang",
    description: "Interactive walk-throughs and learning material curated by Zhouzhou Zhang.",
  },
  "/projects": {
    title: "Projects - Zhouzhou Zhang",
    description: "Explore software engineering projects by Zhouzhou Zhang.",
  },
  "/privacy": {
    title: "Privacy Policy - Zhouzhou Zhang",
    description: "Privacy policy for zhouzhouzhang.co.uk. Learn how your personal data is collected, used, and protected.",
  },
};

export function render(url: string) {
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <ThemeProvider>
          <ErrorProvider>
            <SuccessProvider>
              <FanProvider>
                <EditModeProvider>
                  <SSRApp />
                </EditModeProvider>
              </FanProvider>
            </SuccessProvider>
          </ErrorProvider>
        </ThemeProvider>
      </StaticRouter>
    </React.StrictMode>
  );

  const meta = routeMeta[url] || routeMeta["/"]!;

  return { html, meta };
}
