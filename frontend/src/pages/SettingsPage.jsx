import React, { useState } from "react";

export const SettingsPage = () => {
  const [depotName, setDepotName] = useState("Gandhinagar Depot GJ04");
  const [currency, setCurrency] = useState("INR (Rs)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // RBAC Matrix data structure matching mockup exactly
  const rbacData = [
    {
      role: "Fleet Manager",
      fleet: "✓",
      drivers: "✓",
      trips: "-",
      fuel: "-",
      analytics: "✓",
    },
    {
      role: "Dispatcher",
      fleet: "view",
      drivers: "-",
      trips: "✓",
      fuel: "-",
      analytics: "-",
    },
    {
      role: "Safety Officer",
      fleet: "-",
      drivers: "✓",
      trips: "view",
      fuel: "-",
      analytics: "-",
    },
    {
      role: "Financial Analyst",
      fleet: "view",
      drivers: "-",
      trips: "-",
      fuel: "✓",
      analytics: "✓",
    },
  ];

  // Helper to color-code matrix permissions
  const renderPermissionPill = (val) => {
    if (val === "✓") {
      return <span className="text-[#2E9C7C] font-black text-sm">✓</span>;
    }
    if (val === "view") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase text-[#4C8DFF] bg-[#4C8DFF]/10 border border-[#4C8DFF]/20">
          view
        </span>
      );
    }
    return <span className="text-gray-300 font-bold">-</span>;
  };

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings & RBAC</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Configure general system configurations and review access privileges.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-250/70 text-[#2E9C7C] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ✓ Platform preferences updated successfully!
        </div>
      )}

      {/* Main Grid: General (Left) & RBAC Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column (2/5): General Preferences */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-5">
          <div className="border-b border-gray-100 pb-3 select-none">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">General</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Core preferences and localization defaults.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Depot Name</label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Distance Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
              >
                <option value="Kilometers">Kilometers</option>
                <option value="Miles">Miles</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-32 bg-[#4C8DFF] hover:bg-[#387bf0] text-white py-2.5 rounded-xl font-bold transition shadow-xs text-center text-xs"
            >
              Save changes
            </button>
          </form>
        </section>

        {/* Right Column (3/5): RBAC Grid Checklists */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-5">
          <div className="border-b border-gray-100 pb-3 select-none">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Role-Based Access (RBAC)</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Matrix mapping of authorization levels across platform sections.</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Fleet</th>
                  <th className="px-4 py-3">Drivers</th>
                  <th className="px-4 py-3">Trips</th>
                  <th className="px-4 py-3">Fuel/Exp.</th>
                  <th className="px-4 py-3">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {rbacData.map((row) => (
                  <tr key={row.role} className="hover:bg-gray-55/35 transition font-semibold">
                    <td className="px-4 py-3.5 font-extrabold text-gray-900">
                      {row.role}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPermissionPill(row.fleet)}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPermissionPill(row.drivers)}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPermissionPill(row.trips)}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPermissionPill(row.fuel)}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPermissionPill(row.analytics)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

    </div>
  );
};
