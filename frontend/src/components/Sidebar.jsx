import React from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarLink = ({ to, label, icon, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded transition ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-gray-800 px-4 py-2">Menu</h2>
        
        <SidebarLink
          to="/dashboard"
          label="Dashboard"
          icon="📊"
          active={isActive("/dashboard")}
        />
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-600 px-4 py-2">OPERATIONS</h3>
          
          <SidebarLink
            to="/vehicles"
            label="Vehicles"
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

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-600 px-4 py-2">MANAGEMENT</h3>
          
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

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-600 px-4 py-2">ANALYTICS</h3>
          
          <SidebarLink
            to="/reports"
            label="Reports"
            icon="📈"
            active={isActive("/reports")}
          />
        </div>
      </div>
    </aside>
  );
};
