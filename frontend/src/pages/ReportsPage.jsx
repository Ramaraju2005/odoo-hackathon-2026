import React, { useState } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

const ReportCard = ({ title, icon, onGenerate, onExport }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <span className="text-3xl">{icon}</span>
    </div>
    <div className="flex gap-3">
      <button
        onClick={onGenerate}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
      >
        View
      </button>
      <button
        onClick={onExport}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
      >
        Export CSV
      </button>
    </div>
  </div>
);

export const ReportsPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleGenerateReport = async (reportKey, endpoint) => {
    try {
      setLoading(true);
      setError("");
      const data = await api.get(endpoint, token);
      setReportData(data);
      setSelectedReport(reportKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (reportKey) => {
    try {
      const url = `${API_ENDPOINTS.API_BASE_URL}${API_ENDPOINTS.REPORTS_EXPORT(
        reportKey
      )}`;
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Reports & Analytics</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {reports.map((report) => (
          <ReportCard
            key={report.key}
            title={report.title}
            icon={report.icon}
            onGenerate={() =>
              handleGenerateReport(report.key, report.endpoint)
            }
            onExport={() => handleExportCSV(report.key)}
          />
        ))}
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {reportData.type}
            </h2>
            <button
              onClick={() => {
                setReportData(null);
                setSelectedReport(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>

          {reportData.summary && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600 capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.data && Array.isArray(reportData.data) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(reportData.data[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left font-semibold text-gray-700"
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 text-gray-700"
                        >
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Generating report...</p>
            </div>
          )}
        </div>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            Select a report from above to view details
          </p>
        </div>
      )}
    </div>
  );
};
