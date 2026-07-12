import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const ReportsPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  // KPI summaries loaded dynamically on mount
  const [kpiMetrics, setKpiMetrics] = useState({
    fuelEfficiency: 0,
    fleetUtilization: 0,
    operationalCost: 0,
    vehicleRoi: 0,
    costliestVehicles: [],
  });

  // Active tabular report view states
  const [reportData, setReportData] = useState(null);
  const [selectedReportKey, setSelectedReportKey] = useState("");

  const reports = [
    {
      key: "fuel-efficiency",
      title: "Fuel Efficiency Report",
      icon: "⛽",
      endpoint: API_ENDPOINTS.REPORTS_FUEL_EFFICIENCY,
    },
    {
      key: "fleet-utilization",
      title: "Fleet Utilization Report",
      icon: "📊",
      endpoint: API_ENDPOINTS.REPORTS_FLEET_UTILIZATION,
    },
    {
      key: "operational-cost",
      title: "Operational Cost Report",
      icon: "💰",
      endpoint: API_ENDPOINTS.REPORTS_OPERATIONAL_COST,
    },
    {
      key: "vehicle-roi",
      title: "Vehicle ROI Report",
      icon: "📈",
      endpoint: API_ENDPOINTS.REPORTS_VEHICLE_ROI,
    },
    {
      key: "trips",
      title: "Trips Report",
      icon: "🛣️",
      endpoint: API_ENDPOINTS.REPORTS_TRIPS,
    },
    {
      key: "maintenance",
      title: "Maintenance Report",
      icon: "🔧",
      endpoint: API_ENDPOINTS.REPORTS_MAINTENANCE,
    },
  ];

  const fetchKPIMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const [fuel, fleet, cost, roi] = await Promise.all([
        api.get(API_ENDPOINTS.REPORTS_FUEL_EFFICIENCY, token),
        api.get(API_ENDPOINTS.REPORTS_FLEET_UTILIZATION, token),
        api.get(API_ENDPOINTS.REPORTS_OPERATIONAL_COST, token),
        api.get(API_ENDPOINTS.REPORTS_VEHICLE_ROI, token),
      ]);

      // Calculate costliest vehicles from operational costs
      const sortedCostliest = (cost?.data || [])
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 3);

      setKpiMetrics({
        fuelEfficiency: fuel?.summary?.averageEfficiency || 0,
        fleetUtilization: fleet?.summary?.overallUtilization || 0,
        operationalCost: cost?.summary?.grandTotal || 0,
        vehicleRoi: roi?.summary?.averageROI || 0,
        costliestVehicles: sortedCostliest,
      });
    } catch (err) {
      console.error("Failed to load reports KPI cards summary:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKPIMetrics();
  }, [fetchKPIMetrics]);

  const handleGenerateReport = async (reportKey, endpoint) => {
    try {
      setReportLoading(true);
      setError("");
      const data = await api.get(endpoint, token);
      setReportData(data);
      setSelectedReportKey(reportKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportCSV = async (reportKey) => {
    try {
      const url = `${API_ENDPOINTS.API_BASE_URL}${API_ENDPOINTS.REPORTS_EXPORT(reportKey)}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${reportKey}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  // Safe percentage helper for rendering top costliest vehicle status bar widths
  const getCostPercentage = (totalCost) => {
    if (kpiMetrics.costliestVehicles.length === 0) return 0;
    const maxVal = kpiMetrics.costliestVehicles[0].totalCost || 1;
    return Math.min(100, Math.round((totalCost / maxVal) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Generating Analytics & Charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">Review operational performance metrics and export audit logs.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
        >
          Export PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs no-print">
          ⚠️ {error}
        </div>
      )}

      {/* Mockup's 4 Summary KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-content">
        
        {/* Card 1: Fuel Efficiency */}
        <div className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-4 flex flex-col justify-between min-h-[95px] select-none border-l-4 border-l-[#4C8DFF]">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fuel Efficiency</span>
          <div className="text-xl font-black text-gray-900 tracking-tight mt-2">
            {kpiMetrics.fuelEfficiency} <span className="text-xs text-gray-450 font-bold">km/l</span>
          </div>
        </div>

        {/* Card 2: Fleet Utilization */}
        <div className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-4 flex flex-col justify-between min-h-[95px] select-none border-l-4 border-l-[#2E9C7C]">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fleet Utilization</span>
          <div className="text-xl font-black text-gray-900 tracking-tight mt-2">
            {kpiMetrics.fleetUtilization}%
          </div>
        </div>

        {/* Card 3: Operational Cost */}
        <div className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-4 flex flex-col justify-between min-h-[95px] select-none border-l-4 border-l-[#F5A623]">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Operational Cost</span>
          <div className="text-xl font-black text-gray-900 tracking-tight mt-2 text-amber-600">
            ₹{Math.round(kpiMetrics.operationalCost).toLocaleString()}
          </div>
        </div>

        {/* Card 4: Vehicle ROI */}
        <div className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-4 flex flex-col justify-between min-h-[95px] select-none border-l-4 border-l-[#E24B4A]">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vehicle ROI</span>
          <div className="text-xl font-black text-gray-900 tracking-tight mt-2">
            {kpiMetrics.vehicleRoi}%
          </div>
        </div>

      </section>

      {/* ROI formula caption under KPIs */}
      <div className="px-1 text-[9px] font-bold text-gray-400 select-none">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Chart Rows Grid: Monthly Revenue (Left) & Costliest Vehicles (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start print-content">
        
        {/* Left Column (3/5): Monthly Revenue CSS Chart */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-6">
          <div className="border-b border-gray-100 pb-3 select-none">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Monthly Revenue</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Estimated gross operational earnings per month.</p>
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-[210px] flex items-end justify-between px-2 pt-6 pb-2 relative select-none">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-6 border-t border-dashed border-gray-100"></div>
            <div className="absolute inset-x-0 top-24 border-t border-dashed border-gray-100"></div>
            <div className="absolute inset-x-0 bottom-[35px] border-t border-dashed border-gray-100"></div>

            {/* Bars */}
            {[
              { month: "Dec", height: "35%", value: "₹45,000" },
              { month: "Jan", height: "55%", value: "₹72,000" },
              { month: "Feb", height: "45%", value: "₹59,000" },
              { month: "Mar", height: "70%", value: "₹91,000" },
              { month: "Apr", height: "60%", value: "₹78,000" },
              { month: "May", height: "85%", value: "₹1,12,000" },
              { month: "Jun", height: "75%", value: "₹98,000" },
            ].map((bar, index) => (
              <div key={index} className="flex flex-col items-center gap-2 w-10 group relative z-10">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap shadow-md no-print">
                  {bar.value}
                </div>
                
                {/* Column */}
                <div
                  style={{ height: bar.height }}
                  className="w-full bg-[#4C8DFF]/80 group-hover:bg-[#4C8DFF] rounded-t-lg transition duration-200 shadow-2xs"
                ></div>
                
                {/* Label */}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{bar.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column (2/5): Top Costliest Vehicles */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-6">
          <div className="border-b border-gray-100 pb-3 select-none">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Top Costliest Vehicles</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Fleet assets consuming the highest total maintenance & fuel budget.</p>
          </div>

          {/* List with horizontal progress bars */}
          <div className="space-y-5 text-xs select-none">
            {kpiMetrics.costliestVehicles.length > 0 ? (
              kpiMetrics.costliestVehicles.map((veh, i) => {
                const widthPercent = getCostPercentage(veh.totalCost);
                // Choose progress colors matching mockup
                const colors = ["bg-[#E24B4A]/90", "bg-[#F5A623]/90", "bg-[#4C8DFF]/90"];
                const barColor = colors[i] || "bg-gray-450";

                return (
                  <div key={veh.vehicleId} className="space-y-1.5 font-bold">
                    <div className="flex justify-between items-center text-gray-800">
                      <span>{veh.registrationNo} <span className="text-[10px] text-gray-400">({veh.name})</span></span>
                      <span>₹{Math.round(veh.totalCost).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 font-medium py-6">
                No cost metrics gathered yet.
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Detailed Reports Generation Card */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-6 no-print">
        <div className="border-b border-gray-100 pb-3 select-none">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Generate & Export Logs</h2>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Select a category below to generate live audit logs or download a CSV spreadsheet.</p>
        </div>

        {/* Report selection buttons grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {reports.map((rep) => (
            <div
              key={rep.key}
              className={`border rounded-xl p-3 flex flex-col justify-between items-center text-center gap-3 transition cursor-pointer select-none ${
                selectedReportKey === rep.key
                  ? "bg-[#0F6B5C]/5 border-[#0F6B5C]/45"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
              onClick={() => handleGenerateReport(rep.key, rep.endpoint)}
            >
              <span className="text-xl">{rep.icon}</span>
              <span className="text-[10px] font-black text-gray-800 tracking-tight leading-tight">{rep.title}</span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportCSV(rep.key);
                }}
                className="text-[9px] font-black text-[#0F6B5C] bg-[#0F6B5C]/10 border border-[#0F6B5C]/15 hover:bg-[#0F6B5C]/20 px-2 py-0.5 rounded transition"
              >
                CSV ⬇
              </button>
            </div>
          ))}
        </div>

        {/* Generated Report Display Table */}
        {reportData ? (
          <div className="border border-gray-100 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-55 pb-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">{reportData.type} Data</h3>
              <button
                onClick={() => {
                  setReportData(null);
                  setSelectedReportKey("");
                }}
                className="text-[10px] text-[#E24B4A] hover:underline font-bold"
              >
                Clear
              </button>
            </div>

            {reportLoading ? (
              <div className="text-center py-6 text-xs text-gray-400 font-bold">Querying DB...</div>
            ) : (
              <div className="overflow-x-auto text-[11px] font-semibold">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-55 text-gray-400 text-[9px] font-bold uppercase tracking-wider border-b border-gray-100">
                      {Object.keys(reportData.data[0] || {}).map((headerKey) => (
                        <th key={headerKey} className="px-4 py-2.5">
                          {headerKey.replace(/([A-Z])/g, " $1")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-655">
                    {reportData.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-3">
                            {typeof val === "number"
                              ? val.toFixed(1)
                              : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50/55 rounded-2xl border border-dashed border-gray-200 text-center py-8 text-xs text-gray-400 font-medium select-none">
            Choose a log category above to output live tabular records.
          </div>
        )}
      </section>

    </div>
  );
};
