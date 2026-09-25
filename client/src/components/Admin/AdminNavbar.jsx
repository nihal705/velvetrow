import { Link } from "react-router-dom";
import Logo from "../Logo";

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30">
      <Link to="/" className="max-md:flex-1">
        <Logo />
      </Link>
      <Link
        to="/"
        className="text-sm text-gray-400 hover:text-white transition"
      >
        Back to Site
      </Link>
    </div>
  );
};

export default AdminNavbar;
