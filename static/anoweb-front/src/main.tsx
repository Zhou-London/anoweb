import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router";
import AppRouter from "./App";
import { FanProvider } from "./Contexts/fan_context";
import { ErrorProvider } from "./Contexts/error_context";
import { SuccessProvider } from "./Contexts/success_context";
import { EditModeProvider } from "./Contexts/edit_mode_context";
import { ThemeProvider } from "./Contexts/theme_context";
import Navbar from "./Components/navbar";
import GuestPopup from "./Components/guest_popup";
import AnnouncementPopup from "./Components/announcement_popup";
import EditModeToggle from "./Components/edit_mode_toggle";
import CookieConsentBanner from "./Components/cookie_consent";
import Footer from "./Components/footer";
import { initializeTracking } from "./lib/tracking";
import "./style.css";

function App() {
  const { pathname } = useLocation();
  const isReader = /^\/vbooks\/[^/]+\/.+/.test(pathname);

  useEffect(() => {
    const cleanup = initializeTracking();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-200" style={{ background: 'var(--gb-bg)', color: 'var(--gb-fg)' }}>
      <div className="relative flex-1">
        <Navbar />
        <main className={isReader
          ? "mx-auto max-w-[1800px] px-4 pb-14 pt-4 md:pt-6 md:px-6 lg:px-10"
          : "mx-auto max-w-6xl px-4 pb-14 pt-6 md:pt-10 md:px-8"
        }>
          <AppRouter />
        </main>
      </div>
      <Footer />
      <GuestPopup onOpenAuth={() => {}} />
      <AnnouncementPopup />
      <EditModeToggle />
      <CookieConsentBanner />
    </div>
  );
}

const root = document.getElementById("root")!;
const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ErrorProvider>
          <SuccessProvider>
            <FanProvider>
              <EditModeProvider>
                <App />
              </EditModeProvider>
            </FanProvider>
          </SuccessProvider>
        </ErrorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Hydrate if pre-rendered content exists, otherwise create fresh
if (root.innerHTML.trim() && root.innerHTML.trim() !== "<!--app-html-->") {
  ReactDOM.hydrateRoot(root, tree);
} else {
  ReactDOM.createRoot(root).render(tree);
}
