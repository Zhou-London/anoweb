import { Route, Routes, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Activity from "./Pages/Activity";
import ProjectPage from "./Pages/Projects";
import Home from "./Pages/Home";
import PostWorkspace from "./Pages/Markdown/PostWorkspace";
import AccountPage from "./Pages/Account";
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
          path="/activity"
          element={
            <PageTransition>
              <Activity />
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
      </Routes>
    </AnimatePresence>
  );
}
