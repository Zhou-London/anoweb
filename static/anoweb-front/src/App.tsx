import { Route, Routes, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Community from "./Pages/Community";
import ProjectPage from "./Pages/Projects";
import Home from "./Pages/Home";
import PostWorkspace from "./Pages/Markdown/PostWorkspace";
import AccountPage from "./Pages/Account";
import VerifyEmail from "./Pages/VerifyEmail";
import PageTransition from "./Components/page_transition";

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/community"
          element={
            <PageTransition>
              <Community />
            </PageTransition>
          }
        />
        <Route
          path="/projects"
          element={
            <PageTransition>
              <ProjectPage />
            </PageTransition>
          }
        />
        <Route
          path="/markdown/:postId"
          element={
            <PageTransition>
              <PostWorkspace />
            </PageTransition>
          }
        />
        <Route
          path="/account"
          element={
            <PageTransition>
              <AccountPage />
            </PageTransition>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />
      </Routes>
    </AnimatePresence>
  );
}
