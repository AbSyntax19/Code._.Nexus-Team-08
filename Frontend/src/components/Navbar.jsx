import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { name: "Recommendation", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Scholarships", path: "/scholarships" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                EdBridge
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${pathname === link.path
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}