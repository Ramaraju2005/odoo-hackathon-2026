import React, { useState, useEffect } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

const KPICard = ({ label, value, icon, color }) => (
  <div className={`bg-${color}-50 border-l-4 border-${color}-500 p-6 rounded-lg shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { token } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [costs, setCosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, costData] = await Promise.all([
          api.get(API_ENDPOINTS.DASHBOARD_KPIS, token),
          api.get(API_ENDPOINTS.DASHBOARD_OPERATIONAL_COSTS, token),
        ]);
        setKpis(kpiData);
        setCosts(costData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

      {/* Vehicle KPIs */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Vehicle Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Total Vehicles"
            value={kpis?.vehicles?.total || 0}
            icon="🚗"
            color="blue"
          />
          <KPICard
            label="Active Vehicles"
            value={kpis?.vehicles?.active || 0}
            icon="🚙"
            color="green"
          />
          <KPICard
            label="Available Vehicles"
            value={kpis?.vehicles?.available || 0}
            icon="✅"
            color="yellow"
          />
          <KPICard
            label="In Maintenance"
            value={kpis?.vehicles?.maintenance || 0}
            icon="🔧"
            color="red"
          />
        </div>
      </section>

      {/* Trip KPIs */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Trip Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            label="Active Trips"
            value={kpis?.trips?.active || 0}
            icon="🚀"
            color="purple"
          />
          <KPICard
            label="Pending Trips"
            value={kpis?.trips?.pending || 0}
            icon="⏳"
            color="orange"
          />
          <KPICard
            label="Completed Trips"
            value={kpis?.trips?.completed || 0}
            icon="✓"
            color="green"
          />
        </div>
      </section>

      {/* Driver KPIs */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Driver Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Drivers On Duty"
            value={kpis?.drivers?.onDuty || 0}
            icon="👤"
            color="blue"
          />
          <KPICard
            label="Available Drivers"
            value={kpis?.drivers?.available || 0}
            icon="✅"
            color="green"
          />
          <KPICard
            label="Off Duty"
            value={kpis?.drivers?.offDuty || 0}
            icon="😴"
            color="yellow"
          />
          <KPICard
            label="Suspended"
            value={kpis?.drivers?.suspended || 0}
            icon="⛔"
            color="red"
          />
        </div>
      </section>

      {/* Fleet Metrics */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Fleet Metrics</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Fleet Utilization</p>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">
                  {kpis?.metrics?.fleetUtilization || 0}%
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${kpis?.metrics?.fleetUtilization || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium mb-4">Operational Costs</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Fuel: ${costs?.fuel?.toLocaleString() || 0}</span>
                  <span className="text-sm font-semibold">
                    {costs?.breakdown?.fuelPercentage || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Maintenance: ${costs?.maintenance?.toLocaleString() || 0}</span>
                  <span className="text-sm font-semibold">
                    {costs?.breakdown?.maintenancePercentage || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Other: ${costs?.expenses?.toLocaleString() || 0}</span>
                  <span className="text-sm font-semibold">
                    {costs?.breakdown?.expensesPercentage || 0}%
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-800">Total: ${costs?.total?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
