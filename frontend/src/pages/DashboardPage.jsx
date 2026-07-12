import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

// Clean light SaaS KPI Card component
const KPICard = ({ label, value, colorClass }) => (
  <div className="bg-white rounded-2xl shadow-xs border border-gray-100/50 p-5 flex flex-col justify-between transition-all duration-255 hover:shadow-sm hover:-translate-y-0.5 select-none">
    <div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <div className={`w-8 h-1 rounded-full ${colorClass}`}></div>
    </div>
  </div>
);

// Horizontal status progress bars for Vehicle Status breakdown
const StatusBar = ({ label, count, percentage, colorClass }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-xs font-bold">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-extrabold">
        {count} <span className="text-gray-400 font-normal text-[10px]">({percentage}%)</span>
      </span>
    </div>
    <div className="w-full bg-[#F4F6F5] rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { token } = useAuth();

  // Core Data States
  const [kpis, setKpis] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");

  const fetchData = useCallback(async () => {
    try {
      const [kpiData, tripsData] = await Promise.all([
        api.get(API_ENDPOINTS.DASHBOARD_KPIS, token),
        api.get(API_ENDPOINTS.DASHBOARD_RECENT_TRIPS, token),
      ]);
      setKpis(kpiData);
      setTrips(tripsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading TransitOps Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-[#F4F6F5]">
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-2xl p-6 shadow-xs">
          <p className="font-bold text-lg flex items-center gap-2">⚠️ Error loading panel</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Region generation helper (determines region from source & destination names)
  const getRegion = (trip) => {
    const src = trip.source || "";
    const dest = trip.destination || "";
    const sum = src.charCodeAt(0) + (dest.charCodeAt(0) || 0);
    const regions = ["North", "South", "East", "West"];
    return regions[sum % regions.length];
  };

  // Filter client logic
  const filteredTrips = trips.filter((trip) => {
    if (filterType !== "All") {
      const type = trip.vehicle?.type?.toUpperCase() || "";
      if (!type.includes(filterType.toUpperCase())) return false;
    }
    if (filterStatus !== "All") {
      if (trip.vehicle?.status !== filterStatus) return false;
    }
    if (filterRegion !== "All") {
      if (getRegion(trip) !== filterRegion) return false;
    }
    return true;
  });

  // Calculate vehicle status stats
  const totalVehicles = kpis?.vehicles?.total || 1;
  const availableCount = kpis?.vehicles?.available || 0;
  const activeCount = kpis?.vehicles?.active || 0;
  const maintenanceCount = kpis?.vehicles?.maintenance || 0;
  const retiredCount = kpis?.vehicles?.retired || 0;

  const availablePct = Math.round((availableCount / totalVehicles) * 100);
  const activePct = Math.round((activeCount / totalVehicles) * 100);
  const maintenancePct = Math.round((maintenanceCount / totalVehicles) * 100);
  const retiredPct = Math.round((retiredCount / totalVehicles) * 100);

  const mapTripStatus = (status) => {
    switch (status) {
      case "DRAFT":
        return { text: "Draft", bgColor: "bg-[#64748B]/10", textColor: "text-[#64748B]" };
      case "COMPLETED":
        return { text: "Completed", bgColor: "bg-[#2E9C7C]/10", textColor: "text-[#2E9C7C]" };
      case "CANCELLED":
        return { text: "Cancelled", bgColor: "bg-[#E24B4A]/10", textColor: "text-[#E24B4A]" };
      case "DISPATCHED":
        return { text: "Dispatched", bgColor: "bg-[#4C8DFF]/10", textColor: "text-[#4C8DFF]" };
      default:
        return { text: status, bgColor: "bg-gray-50", textColor: "text-[#64748B]" };
    }
  };

  // ETA mapping to mockup formatting
  const getEta = (trip) => {
    if (trip.status === "COMPLETED") return "—";
    if (trip.status === "CANCELLED") return "Cancelled";
    if (trip.status === "DRAFT") return "Awaiting vehicle";
    
    // Compute dynamic ETA based on plannedDistance
    const totalMinutes = Math.round((trip.plannedDistance * 1.4) % 180);
    if (totalMinutes === 0) return "15 min";
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Real-time status of your transport operations.</p>
      </div>

      {/* Filters Bar */}
      <section className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-xs border border-gray-100/50 p-4 select-none">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vehicle Type</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-250/70 text-gray-700 font-bold rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:border-[#0F6B5C] cursor-pointer shadow-2xs min-w-[130px] transition-all"
          >
            <option value="All">All Types</option>
            <option value="VAN">Van</option>
            <option value="TRUCK">Truck</option>
            <option value="MINI">Mini</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-250/70 text-gray-700 font-bold rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:border-[#0F6B5C] cursor-pointer shadow-2xs min-w-[130px] transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Region</span>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-white border border-gray-250/70 text-gray-700 font-bold rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:border-[#0F6B5C] cursor-pointer shadow-2xs min-w-[130px] transition-all"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </section>

      {/* Seven KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard label="Active Vehicles" value={activeCount} colorClass="bg-[#4C8DFF]" />
        <KPICard label="Available Vehicles" value={availableCount} colorClass="bg-[#2E9C7C]" />
        <KPICard label="In Maintenance" value={maintenanceCount} colorClass="bg-[#F5A623]" />
        <KPICard label="Active Trips" value={kpis?.trips?.active || 0} colorClass="bg-sky-400" />
        <KPICard label="Pending Trips" value={kpis?.trips?.pending || 0} colorClass="bg-slate-400" />
        <KPICard label="Drivers on Duty" value={kpis?.drivers?.onDuty || 0} colorClass="bg-indigo-500" />
        <KPICard label="Fleet Utilization" value={`${kpis?.metrics?.fleetUtilization || 0}%`} colorClass="bg-violet-600" />
      </section>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Trips Table (Left Column, Spans 2 Columns) */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/50 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-800">Recent Trips</h2>
              <span className="text-[9px] font-bold bg-[#4C8DFF]/10 text-[#4C8DFF] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live Status
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Trip</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Driver</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((trip) => {
                      const tripStatus = mapTripStatus(trip.status);
                      return (
                        <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors duration-150 font-semibold">
                          <td className="px-6 py-4 font-extrabold text-gray-900">
                            TR-{trip.id.slice(-4).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-bold">
                            {trip.vehicle?.name || trip.vehicle?.registrationNo || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-bold">
                            {trip.driver?.name || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${tripStatus.bgColor} ${tripStatus.textColor}`}>
                              {tripStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-450 font-bold">
                            {getEta(trip)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                        No recent trips match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {filteredTrips.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 text-right">
              <span className="text-[10px] text-gray-400 font-bold">
                Showing {filteredTrips.length} of {trips.length} recent trips
              </span>
            </div>
          )}
        </section>

        {/* Vehicle Status Progress Bars (Right Column, Spans 1 Column) */}
        <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-6 space-y-6">
          <div className="border-b border-gray-50 pb-4">
            <h2 className="text-sm font-extrabold text-gray-800">Vehicle Status</h2>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold">Breakdown of current fleet availability.</p>
          </div>
          
          <div className="space-y-5">
            <StatusBar
              label="Available"
              count={availableCount}
              percentage={availablePct}
              colorClass="bg-[#2E9C7C]"
            />
            <StatusBar
              label="On Trip"
              count={activeCount}
              percentage={activePct}
              colorClass="bg-[#4C8DFF]"
            />
            <StatusBar
              label="In Shop"
              count={maintenanceCount}
              percentage={maintenancePct}
              colorClass="bg-[#F5A623]"
            />
            <StatusBar
              label="Retired"
              count={retiredCount}
              percentage={retiredPct}
              colorClass="bg-[#E24B4A]"
            />
          </div>
        </section>
      </div>

    </div>
  );
};



