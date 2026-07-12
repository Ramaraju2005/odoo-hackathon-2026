import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || "John Doe";
  const displayRole = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase().replace("_", " ")
    : "Admin";

  // Calculate initials
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const nextDark = !isDark;
    document.documentElement.classList.toggle("dark", nextDark);
    setIsDark(nextDark);
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 select-none">
      <div className="flex justify-between items-center w-full">
        {/* Search Input with Shortcut Hint */}
        <div className="relative flex items-center">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-[#F4F6F5] border border-transparent text-gray-800 placeholder-gray-400 rounded-xl pl-9 pr-14 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:bg-white focus:border-[#0F6B5C] transition-all duration-200 w-64"
          />
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            <kbd className="text-[9px] font-bold text-gray-400 bg-white border border-gray-250/70 px-1.5 py-0.5 rounded-md shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </div>
        
        {/* Right Section Actions */}
        <div className="flex items-center gap-5">
          {/* Quick Actions */}
          <div className="flex items-center gap-2 border-r border-gray-100 pr-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0F6B5C] hover:bg-gray-50 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            {/* Notifications */}
            <button
              className="relative p-1.5 rounded-lg text-gray-400 hover:text-[#0F6B5C] hover:bg-gray-50 transition-colors"
              title="Notifications"
            >
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E24B4A] rounded-full border border-white"></span>
            </button>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800 leading-tight">{displayName}</p>
              <span className="inline-block text-[9px] font-bold bg-[#62A69A]/10 text-[#0F6B5C] px-1.5 py-0.5 rounded mt-0.5 uppercase tracking-wider">
                {displayRole}
              </span>
            </div>
            
            {/* Initials Avatar */}
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0F6B5C]/5 border border-[#0F6B5C]/10 text-[#0F6B5C] text-xs font-extrabold shadow-2xs">
              {initials}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-[#E24B4A] font-bold transition-colors ml-2"
            title="Logout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};


