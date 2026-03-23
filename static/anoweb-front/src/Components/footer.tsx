import { Link } from "react-router";

export default function Footer() {
  return (
    <footer
      className="mt-auto py-6 text-center text-xs"
      style={{ color: "var(--gb-fg-muted)" }}
    >
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>&copy; {new Date().getFullYear()} Zhouzhou (JoJo) Zhang</span>
        <span className="hidden sm:inline" style={{ color: "var(--gb-fg-faint)" }}>|</span>
        <Link
          to="/privacy"
          className="transition-colors hover:underline"
          style={{ color: "var(--gb-fg-muted)" }}
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
