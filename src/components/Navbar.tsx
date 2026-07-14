import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Cpu, Compass } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-base font-display">
              B
            </div>
            <span className="text-lg font-bold text-neutral-900 font-display tracking-tight hover:text-brand transition-colors">
              Betavan <span className="text-brand font-mono text-sm font-medium">CMS</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors flex items-center">
              <Compass className="w-4 h-4 mr-1 text-neutral-400" /> Discover Blog
            </Link>
            <Link to="/ai-topics" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-neutral-400" /> AI Topics
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            {token && user ? (
              <div className="flex items-center space-x-3.5">
                <Link 
                  to="/admin" 
                  className="inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 mr-1 text-neutral-500" /> Admin Console
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
              >
                Log In
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
