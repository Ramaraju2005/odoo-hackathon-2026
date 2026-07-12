import React from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarLink = ({ to, label, icon, active }) => (
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

export const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-[230px] bg-[#0F6B5C] min-h-screen p-5 flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Brand Logo / Header */}
        <div className="flex items-center gap-2.5 px-3 py-1 mb-4">
          <span className="text-xl bg-white/10 p-2 rounded-xl text-white">🚚</span>
          <span className="text-lg font-bold tracking-wider text-white uppercase">TransitOps</span>
        </div>

        {/* Group 1: LOGISTICS */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">LOGISTICS</span>
          <SidebarLink
            to="/dashboard"
            label="Dashboard"
            icon="📊"
            active={isActive("/dashboard")}
          />
          
          <SidebarLink
            to="/vehicles"
            label="Fleet"
            icon="🚗"
            active={isActive("/vehicles")}
          />
          
          <SidebarLink
            to="/drivers"
            label="Drivers"
            icon="👤"
            active={isActive("/drivers")}
          />
          
          <SidebarLink
            to="/trips"
            label="Trips"
            icon="🛣️"
            active={isActive("/trips")}
          />
        </div>

        {/* Group 2: OPERATIONS */}
        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">OPERATIONS</span>
          <SidebarLink
            to="/maintenance"
            label="Maintenance"
            icon="🔧"
            active={isActive("/maintenance")}
          />
          
          <SidebarLink
            to="/fuel"
            label="Fuel & Expenses"
            icon="⛽"
            active={isActive("/fuel")}
          />
        </div>

        {/* Group 3: SYSTEM */}
        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-bold text-[#62A69A] uppercase tracking-widest px-3 block mb-2">SYSTEM</span>
          <SidebarLink
            to="/reports"
            label="Analytics"
            icon="📈"
            active={isActive("/reports")}
          />

          <SidebarLink
            to="/settings"
            label="Settings"
            icon="⚙️"
            active={isActive("/settings")}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#137a6b] pt-4 px-3">
        <p className="text-[11px] text-[#62A69A] font-semibold">TransitOps platform</p>
        <p className="text-[9px] text-[#62A69A]/70 mt-0.5">v2.1.0 • Odoo Hackathon</p>
      </div>
    </aside>
  );
};

