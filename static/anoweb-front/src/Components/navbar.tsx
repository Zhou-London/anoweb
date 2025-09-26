import { useContext } from "react";
import { Link } from "react-router";
import { AdminContext } from "../Contexts/admin_context";

export default function Navbar() {
  const { isAdmin, setIsAdmin } = useContext(AdminContext);

  const handleAdminLogin = async () => {
    const pass = prompt("Enter admin password:");
    if (!pass) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Admin validated!");
        setIsAdmin(true);
      } else {
        alert("Invalid password");
        setIsAdmin(false);
      }
    } catch (err) {
      alert("Error contacting server");
      console.error(err);
      setIsAdmin(false);
    }
  };

  return (
    <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-md px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <h1 className="text-lg md:text-xl font-bold text-gray-800">
        zhouzhouzhang.co.uk
      </h1>
      <div className="space-x-3 md:space-x-6 flex items-center">
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
        <button
          onClick={handleAdminLogin}
          className="text-gray-700 hover:text-blue-600 font-medium text-sm md:text-base"
        >
          Admin
        </button>
        {isAdmin && (
          <span className="text-green-600 font-semibold">✔ Admin Mode</span>
        )}
      </div>
    </nav>
  );
}
