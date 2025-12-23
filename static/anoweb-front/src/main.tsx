import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AppRouter from "./App";
import { AdminProvider } from "./Contexts/admin_context";
import { MarkdownReaderProvider } from "./Contexts/markdown_reader";
import Navbar from "./Components/navbar";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <MarkdownReaderProvider>
          <div className="min-h-screen w-full bg-[#f5f7fb] text-slate-900">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-10 md:px-8">
              <AppRouter />
            </main>
          </div>
        </MarkdownReaderProvider>
      </AdminProvider>
    </BrowserRouter>
  </React.StrictMode>
);
