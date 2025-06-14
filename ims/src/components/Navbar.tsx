import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/logout";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const confirmRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    setShowConfirm(false);
    setIsOpen(false);
    await logout();
  };

  // Close confirm box on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(event.target as Node)
      ) {
        setShowConfirm(false);
      }
    }
    if (showConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showConfirm]);

  const menuItems = [
    { name: "Product", path: "/products" },
    { name: "Inventory", path: "/inventory" },
    { name: "Records", path: "/records" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const activeClassName = "text-header-text-active font-bold";
  const normalClassName = "hover:underline cursor-pointer";

  return (
    <nav className="bg-header-bg text-header-text w-full px-6 py-3 shadow rounded-b-lg relative">
      <div className="max-w mx-auto flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <img src="../src/assets/logo.png" alt="Logo" className="h-8 w-8" />
          <div className="text-xl font-bold">Assetly </div>
        </div>

        {/* Menu Toggle (Mobile) */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Items (Desktop) */}
        <ul className="hidden md:flex space-x-6 items-center relative">
          {menuItems.map(({ name, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive ? activeClassName : normalClassName
                }
              >
                {name}
              </NavLink>
            </li>
          ))}
          <li className="relative">
            <button
              onMouseEnter={() => setShowConfirm(true)}
              className="text-red-400 cursor-pointer"
            >
              Logout
            </button>

            {/* Confirmation Box */}
            {showConfirm && (
              <div
                ref={confirmRef}
                className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg p-2 w-36 text-center z-50"
              >
                <div className="mb-2 text-sm font-medium text-gray-700">
                  Confirm Logout?
                </div>
                <div className="flex justify-around gap-2">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-4 space-y-3 px-4">
          {menuItems.map(({ name, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive ? activeClassName : normalClassName
                }
                onClick={() => setIsOpen(false)}
              >
                {name}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={async () => {
                setIsOpen(false);
                if (window.confirm("Are you sure you want to logout?")) {
                  await logout();
                }
              }}
              className="text-red-400 cursor-pointer"
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
