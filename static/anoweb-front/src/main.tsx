import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link } from "react-router";
import AppRouter from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-r from-blue-100 to-purple-200">
        <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-md px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            AnonChihaya.co.uk
          </h1>
          <div className="space-x-3 md:space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium text-sm md:text-base"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium text-sm md:text-base"
            >
              About
            </Link>
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-8">
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
