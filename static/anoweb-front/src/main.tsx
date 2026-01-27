import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AppRouter from "./App";
import { FanProvider } from "./Contexts/fan_context";
import { ErrorProvider } from "./Contexts/error_context";
import { SuccessProvider } from "./Contexts/success_context";
import { EditModeProvider } from "./Contexts/edit_mode_context";
import Navbar from "./Components/navbar";
import GuestPopup from "./Components/guest_popup";
import EditModeToggle from "./Components/edit_mode_toggle";
import { initializeTracking } from "./lib/tracking";

document.documentElement.setAttribute("data-color-mode", "light");
if (document.body) {
  document.body.setAttribute("data-color-mode", "light");
}

function App() {
  useEffect(() => {
    // Initialize tracking
    const cleanup = initializeTracking();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0fe] via-[#f5f7fb] to-[#e8eaed] text-slate-900">
      <div className="relative">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:pt-10 md:px-8">
          <AppRouter />
        </main>
      </div>
      <GuestPopup onOpenAuth={() => {/* Auth modal handled by navbar */}} />
      <EditModeToggle />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorProvider>
        <SuccessProvider>
          <FanProvider>
            <EditModeProvider>
              <App />
            </EditModeProvider>
          </FanProvider>
        </SuccessProvider>
      </ErrorProvider>
    </BrowserRouter>
  </React.StrictMode>
);
