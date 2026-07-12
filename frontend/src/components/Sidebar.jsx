import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Access matrix to check link visibility
const ROLE_ACCESS = {
  ADMIN: ["/dashboard", "/vehicles", "/drivers", "/trips", "/maintenance", "/fuel", "/reports", "/settings"],
  FLEET_MANAGER: ["/dashboard", "/vehicles", "/drivers", "/maintenance", "/reports", "/settings"],
  DISPATCHER: ["/dashboard", "/vehicles", "/trips", "/settings"],
  SAFETY_OFFICER: ["/dashboard", "/drivers", "/trips", "/settings"],
  FINANCIAL_ANALYST: ["/dashboard", "/vehicles", "/fuel", "/reports", "/settings"],
};

const SidebarLink = ({ to, label, icon, active, visible }) => {
  if (!visible) return null;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
        active
          ? "bg-[#2E9C7C] text-white font-semibold shadow-sm"
          : "text-[#9ECBC2] hover:bg-[#137a6b] hover:text-white"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="text-sm tracking-wide">{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  
  const role = user?.role || "DISPATCHER";
  const allowedPaths = ROLE_ACCESS[role] || ROLE_ACCESS.DISPATCHER;

  const isVisible = (path) => allowedPaths.includes(path);

  // Group visibility calculations
  const showLogistics = isVisible("/dashboard") || isVisible("/vehicles") || isVisible("/drivers") || isVisible("/trips");
  const showOperations = isVisible("/maintenance") || isVisible("/fuel");
  const showSystem = isVisible("/reports") || isVisible("/settings");

  return (
    <aside className="w-[230px] bg-[#0F6B5C] min-h-screen p-5 flex flex-col justify-between select-none no-print">
      <div className="space-y-6">
        {/* Brand Logo / Header */}
        <div className="flex items-center gap-2.5 px-3 py-1 mb-4">
          <span className="text-xl bg-white/10 p-2 rounded-xl text-white">🚚</span>
          <span className="text-lg font-bold tracking-wider text-white uppercase">TransitOps</span>
        </div>

        {/* Group 1: LOGISTICS */}
        {showLogistics && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">LOGISTICS</span>
            <SidebarLink
              to="/dashboard"
              label="Dashboard"
              icon="📊"
              active={isActive("/dashboard")}
              visible={isVisible("/dashboard")}
            />
            
            <SidebarLink
              to="/vehicles"
              label="Fleet"
              icon="🚗"
              active={isActive("/vehicles")}
              visible={isVisible("/vehicles")}
            />
            
            <SidebarLink
              to="/drivers"
              label="Drivers"
              icon="👤"
              active={isActive("/drivers")}
              visible={isVisible("/drivers")}
            />
            
            <SidebarLink
              to="/trips"
              label="Trips"
              icon="🛣️"
              active={isActive("/trips")}
              visible={isVisible("/trips")}
            />
          </div>
        )}

        {/* Group 2: OPERATIONS */}
        {showOperations && (
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">OPERATIONS</span>
            <SidebarLink
              to="/maintenance"
              label="Maintenance"
              icon="🔧"
              active={isActive("/maintenance")}
              visible={isVisible("/maintenance")}
            />
            
            <SidebarLink
              to="/fuel"
              label="Fuel & Expenses"
              icon="⛽"
              active={isActive("/fuel")}
              visible={isVisible("/fuel")}
            />
          </div>
        )}

        {/* Group 3: SYSTEM */}
        {showSystem && (
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">SYSTEM</span>
            <SidebarLink
              to="/reports"
              label="Analytics"
              icon="📈"
              active={isActive("/reports")}
              visible={isVisible("/reports")}
            />

            <SidebarLink
              to="/settings"
              label="Settings"
              icon="⚙️"
              active={isActive("/settings")}
              visible={isVisible("/settings")}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#137a6b] pt-4 px-3">
        <p className="text-[11px] text-[#62A69A] font-semibold">TransitOps platform</p>
        <p className="text-[9px] text-[#62A69A]/70 mt-0.5">v2.1.0 • Odoo Hackathon</p>
      </div>
    </aside>
  );
};
