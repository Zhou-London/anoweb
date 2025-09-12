import { Route, Routes } from "react-router";
import Home from "./Pages/home";
import About from "./Pages/about";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
