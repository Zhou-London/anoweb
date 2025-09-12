import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link } from "react-router";
import AppRouter from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 to-purple-200">
        <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-md px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">AnonChihaya.co.uk</h1>
          <div className="space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              About
            </Link>
          </div>
        </nav>
        <main className="flex-1 p-8">
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
