import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AppRouter from "./App";
import { UserProvider } from "./Contexts/user_context";
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
      <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
        <div className="mx-auto max-w-6xl h-full bg-[radial-gradient(circle_at_10%_20%,rgba(66,133,244,0.12),transparent_25%),radial-gradient(circle_at_90%_20%,rgba(52,168,83,0.12),transparent_23%),radial-gradient(circle_at_30%_80%,rgba(244,180,0,0.1),transparent_20%),radial-gradient(circle_at_80%_70%,rgba(234,67,53,0.12),transparent_24%)]" />
      </div>
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
          <UserProvider>
            <EditModeProvider>
              <App />
            </EditModeProvider>
          </UserProvider>
        </SuccessProvider>
      </ErrorProvider>
    </BrowserRouter>
  </React.StrictMode>
);
