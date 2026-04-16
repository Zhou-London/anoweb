import { Route, Routes } from "react-router";
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

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/community" element={<Community />} />
      <Route path="/projects" element={<ProjectPage />} />
      <Route path="/markdown/:postId" element={<PostWorkspace />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/:blogId" element={<BlogWorkspace />} />
      <Route path="/vbooks" element={<VBooksPage />} />
      <Route path="/vbooks/:vbookId" element={<VBookDetail />} />
      <Route path="/vbooks/:vbookId/:chapterId" element={<VBookReader />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
}
