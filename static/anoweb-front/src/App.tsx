import { Route, Routes } from "react-router";
import About from "./Pages/About/about";
import ProjectPage from "./Pages/Projects";
import Home from "./Pages/Home";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<ProjectPage />} />
    </Routes>
  );
}
