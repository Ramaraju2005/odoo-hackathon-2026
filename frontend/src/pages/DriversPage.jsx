import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const DriversPage = () => {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  
  // Toggle Status Filter and Sorting States
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // Email Reminders Simulation State
  const [reminderMessage, setReminderMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    licenseNo: "",
    licenseCategory: "LMV",
    licenseExpiryDate: "",
    contactNumber: "",
    safetyScore: "100",
    status: "AVAILABLE",
  });

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(API_ENDPOINTS.DRIVERS_LIST, token);
      setDrivers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        safetyScore: parseFloat(formData.safetyScore),
      };
      if (editingId) {
        await api.put(API_ENDPOINTS.DRIVERS_UPDATE(editingId), dataToSubmit, token);
      } else {
        await api.post(API_ENDPOINTS.DRIVERS_CREATE, dataToSubmit, token);
      }
      fetchDrivers();
      setShowForm(false);
      setFormData({
        name: "",
        licenseNo: "",
        licenseCategory: "LMV",
        licenseExpiryDate: "",
        contactNumber: "",
        safetyScore: "100",
        status: "AVAILABLE",
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      licenseNo: driver.licenseNo,
      licenseCategory: driver.licenseCategory || "LMV",
      licenseExpiryDate: driver.licenseExpiryDate
        ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
        : "",
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore.toString(),
      status: driver.status,
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.delete(API_ENDPOINTS.DRIVERS_DELETE(id), token);
        fetchDrivers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Expiry Date Format (MM/YYYY)
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const expiredLabel = isLicenseExpired(dateString) ? " EXPIRY" : "";
    return `${mm}/${yyyy}${expiredLabel}`;
  };

  // Status Badge configurations matching mockup style
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return { text: "Available", colorClass: "text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20" };
      case "ON_TRIP":
        return { text: "On Trip", colorClass: "text-[#4C8DFF] bg-[#4C8DFF]/10 border border-[#4C8DFF]/20" };
      case "OFF_DUTY":
        return { text: "Off Duty", colorClass: "text-[#64748B] bg-[#64748B]/10 border border-[#64748B]/20" };
      case "SUSPENDED":
        return { text: "Suspended", colorClass: "text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20" };
      default:
        return { text: status, colorClass: "text-gray-500 bg-gray-50 border border-gray-100" };
    }
  };

  // Safety Badge config: Suspended if status is SUSPENDED, On Trip if status is ON_TRIP, else Available
  const getSafetyBadge = (status) => {
    if (status === "SUSPENDED") {
      return { text: "Suspended", colorClass: "text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20" };
    }
    if (status === "ON_TRIP") {
      return { text: "On Trip", colorClass: "text-[#4C8DFF] bg-[#4C8DFF]/10 border border-[#4C8DFF]/20" };
    }
    return { text: "Available", colorClass: "text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20" };
  };

  // Column sorting action
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // Filter Drivers based on duty status
  const filteredDrivers = drivers.filter((drv) => {
    if (filterStatus !== "All" && drv.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // Apply sorting
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    let valA = a[sortBy] ?? "";
    let valB = b[sortBy] ?? "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate expiring licenses count (< 30 days)
  const expiringDrivers = drivers.filter((drv) => {
    if (!drv.licenseExpiryDate) return false;
    const daysLeft = (new Date(drv.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  });

  // Trigger alerts simulation
  const handleSendReminders = () => {
    if (expiringDrivers.length === 0) {
      setReminderMessage("All drivers have valid credentials. No licenses are expiring in the next 30 days.");
      return;
    }
    const names = expiringDrivers.map((d) => d.name).join(", ");
    setReminderMessage(`✉ Simulator Success: Dispatched license renewal reminder email notifications to: ${names}.`);
    setTimeout(() => setReminderMessage(""), 6000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading Driver Profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Drivers & Safety Profiles</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">Monitor credentials, safety records, and dispatch readiness.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              name: "",
              licenseNo: "",
              licenseCategory: "LMV",
              licenseExpiryDate: "",
              contactNumber: "",
              safetyScore: "100",
              status: "AVAILABLE",
            });
          }}
          className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
        >
          + Add Driver
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Add / Edit Driver Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-base font-extrabold text-gray-900">
                {editingId ? "Modify Driver Profile" : "Register New Operator"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">License No</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-88213"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  >
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                    <option value="LCV">LCV</option>
                    <option value="HCV">HCV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact No.</label>
                  <input
                    type="tel"
                    placeholder="e.g. 98765xxxxx"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Trip Compl. / Safety Score (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 96"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duty Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-[#0F6B5C] hover:bg-[#0c594c] text-white py-2.5 rounded-xl font-bold transition shadow-xs"
                >
                  {editingId ? "Save Changes" : "Register Operator"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-50 border border-gray-250/70 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drivers List Card Table */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-gray-55 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th onClick={() => handleSort("name")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Driver {sortBy === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("licenseNo")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  License No {sortBy === "licenseNo" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("licenseCategory")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Category {sortBy === "licenseCategory" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("licenseExpiryDate")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Expiry {sortBy === "licenseExpiryDate" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th className="px-6 py-3.5">Contact</th>
                <th onClick={() => handleSort("safetyScore")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Trip Compl. {sortBy === "safetyScore" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th className="px-6 py-3.5">Safety</th>
                <th onClick={() => handleSort("status")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Status {sortBy === "status" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {sortedDrivers.length > 0 ? (
                sortedDrivers.map((driver) => {
                  const statusInfo = getStatusBadge(driver.status);
                  const safetyInfo = getSafetyBadge(driver.status);
                  const isExpired = isLicenseExpired(driver.licenseExpiryDate);

                  return (
                    <tr key={driver.id} className="hover:bg-gray-55/35 transition-colors duration-150 font-semibold">
                      <td className="px-6 py-4 font-extrabold text-gray-900">
                        {driver.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {driver.licenseNo}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {driver.licenseCategory || "LMV"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isExpired ? "text-[#E24B4A] uppercase" : "text-gray-500"}`}>
                          {formatExpiryDate(driver.licenseExpiryDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {driver.contactNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-extrabold">
                        {Math.round(driver.safetyScore)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${safetyInfo.colorClass}`}>
                          {safetyInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${statusInfo.colorClass}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] space-x-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="text-[#0F6B5C] bg-[#0F6B5C]/5 border border-[#0F6B5C]/15 hover:bg-[#0F6B5C]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="text-[#E24B4A] bg-[#E24B4A]/5 border border-[#E24B4A]/15 hover:bg-[#E24B4A]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-medium">
                    No operator profiles match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Safety Compliance Alert Panel for safety officer email reminders */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none">
        <div>
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Safety Compliance: Expiry Alert Manager</h4>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {expiringDrivers.length} driver(s) have licenses expiring in the next 30 days.
          </p>
        </div>
        <button
          onClick={handleSendReminders}
          className="bg-[#F5A623] hover:bg-[#d98516] text-white px-4 py-2 rounded-xl text-[10px] font-bold transition shadow-2xs whitespace-nowrap"
        >
          ✉ Send Expiry Reminders
        </button>
      </section>

      {reminderMessage && (
        <div className="bg-emerald-50 border border-emerald-250/70 text-[#2E9C7C] rounded-xl p-3.5 text-[10px] font-bold shadow-2xs select-none">
          {reminderMessage}
        </div>
      )}

      {/* Filter Options and Rule Caption Section */}
      <section className="flex flex-col space-y-4 pt-2">
        {/* Toggle Status Buttons */}
        <div className="flex flex-col space-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Toggle Status Filter</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setFilterStatus("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === "All"
                  ? "bg-[#0F6B5C] text-white border-[#0F6B5C] shadow-xs"
                  : "bg-white text-gray-650 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Show All
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "AVAILABLE" ? "All" : "AVAILABLE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === "AVAILABLE"
                  ? "bg-[#2E9C7C] text-white border-[#2E9C7C] shadow-xs"
                  : "bg-white text-[#2E9C7C] border-gray-200 hover:bg-[#2E9C7C]/5"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "ON_TRIP" ? "All" : "ON_TRIP")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === "ON_TRIP"
                  ? "bg-[#4C8DFF] text-white border-[#4C8DFF] shadow-xs"
                  : "bg-white text-[#4C8DFF] border-gray-200 hover:bg-[#4C8DFF]/5"
              }`}
            >
              On Trip
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "OFF_DUTY" ? "All" : "OFF_DUTY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === "OFF_DUTY"
                  ? "bg-[#64748B] text-white border-[#64748B] shadow-xs"
                  : "bg-white text-[#64748B] border-gray-200 hover:bg-[#64748B]/5"
              }`}
            >
              Off Duty
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "SUSPENDED" ? "All" : "SUSPENDED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === "SUSPENDED"
                  ? "bg-[#F5A623] text-white border-[#F5A623] shadow-xs"
                  : "bg-white text-[#F5A623] border-gray-200 hover:bg-[#F5A623]/5"
              }`}
            >
              Suspended
            </button>
          </div>
        </div>

        {/* Business Rule Warning Note */}
        <div className="px-1">
          <p className="text-[10px] text-amber-600 font-bold tracking-wide">
            Rule: Expired license or Suspended status → blocked from trip assignment
          </p>
        </div>
      </section>

    </div>
  );
};
