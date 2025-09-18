import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AppRouter from "./App";
import { AdminProvider } from "./Contexts/admin_context";
import Navbar from "./Components/navbar";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-r from-blue-100 to-purple-200">
          <Navbar />
          <main className="flex-1 p-4 md:p-8">
            <AppRouter />
          </main>
        </div>
      </AdminProvider>
    </BrowserRouter>
  </React.StrictMode>
);
