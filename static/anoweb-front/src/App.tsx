import { Route, Routes } from "react-router";
import Activity from "./Pages/Activity";
import ProjectPage from "./Pages/Projects";
import Home from "./Pages/Home";
import PostWorkspace from "./Pages/Markdown/PostWorkspace";
import AccountPage from "./Pages/Account";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/projects" element={<ProjectPage />} />
      <Route path="/markdown/:postId" element={<PostWorkspace />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
}
