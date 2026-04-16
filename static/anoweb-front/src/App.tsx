import { Route, Routes, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Community from "./Pages/Community";
import ProjectPage from "./Pages/Projects";
import Home from "./Pages/Home";
import PostWorkspace from "./Pages/Markdown/PostWorkspace";
import BlogsPage from "./Pages/Blogs";
import BlogWorkspace from "./Pages/Blogs/BlogWorkspace";
import VBooksPage from "./Pages/VBooks";
import VBookDetail from "./Pages/VBooks/VBookDetail";
import VBookReader from "./Pages/VBooks/VBookReader";
import AccountPage from "./Pages/Account";
import VerifyEmail from "./Pages/VerifyEmail";
import PrivacyPolicyPage from "./Pages/PrivacyPolicy";
import PageTransition from "./Components/page_transition";

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectPage /></PageTransition>} />
        <Route path="/markdown/:postId" element={<PageTransition><PostWorkspace /></PageTransition>} />
        <Route path="/blogs" element={<PageTransition><BlogsPage /></PageTransition>} />
        <Route path="/blogs/:blogId" element={<PageTransition><BlogWorkspace /></PageTransition>} />
        <Route path="/vbooks" element={<PageTransition><VBooksPage /></PageTransition>} />
        <Route path="/vbooks/:vbookId" element={<PageTransition><VBookDetail /></PageTransition>} />
        <Route path="/vbooks/:vbookId/:chapterId" element={<PageTransition><VBookReader /></PageTransition>} />
        <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
