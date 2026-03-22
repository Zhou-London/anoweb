import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
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
import { initializeTracking } from "./lib/tracking";
import "./style.css";

function App() {
  useEffect(() => {
    const cleanup = initializeTracking();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen w-full transition-colors duration-200" style={{ background: 'var(--gb-bg)', color: 'var(--gb-fg)' }}>
      <div className="relative">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:pt-10 md:px-8">
          <AppRouter />
        </main>
      </div>
      <GuestPopup onOpenAuth={() => {}} />
      <AnnouncementPopup />
      <EditModeToggle />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
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
