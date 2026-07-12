import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const VehiclesPage = () => {
  const { token, user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  
  // Search, Filter, and Sorting States
  const [searchReg, setSearchReg] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("registrationNo");
  const [sortDir, setSortDir] = useState("asc");

  // View-Only logic based on RBAC rules
  const isReadOnly = user?.role === "DISPATCHER" || user?.role === "FINANCIAL_ANALYST";

  // Document Manager simulation state
  const [docVehicleNo, setDocVehicleNo] = useState(null);
  const [docList, setDocList] = useState([
    { name: "Registration Certificate (RC)", expiry: "12/2030", status: "Verified" },
    { name: "Pollution Under Control (PUC)", expiry: "09/2026", status: "Active" },
    { name: "Commercial Fleet Insurance", expiry: "05/2027", status: "Verified" },
  ]);
  const [newDocType, setNewDocType] = useState("Fitness Certificate");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const [formData, setFormData] = useState({
    registrationNo: "",
    name: "",
    type: "Truck",
    maxLoadCapacity: "",
    odometer: "0",
    acquisitionCost: "",
    status: "AVAILABLE",
  });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(API_ENDPOINTS.VEHICLES_LIST, token);
      setVehicles(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      if (editingId) {
        await api.put(API_ENDPOINTS.VEHICLES_UPDATE(editingId), formData, token);
      } else {
        await api.post(API_ENDPOINTS.VEHICLES_CREATE, formData, token);
      }
      fetchVehicles();
      setShowForm(false);
      setFormData({
        registrationNo: "",
        name: "",
        type: "Truck",
        maxLoadCapacity: "",
        odometer: "0",
        acquisitionCost: "",
        status: "AVAILABLE",
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vehicle) => {
    if (isReadOnly) return;
    setFormData({
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
    });
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await api.delete(API_ENDPOINTS.VEHICLES_DELETE(id), token);
        fetchVehicles();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Convert kg load capacity to Tons if >= 1000kg
  const formatCapacity = (kg) => {
    if (kg >= 1000) {
      const tons = kg / 1000;
      return `${tons} Ton`;
    }
    return `${kg} kg`;
  };

  // Status mapping to mockup badges
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return { text: "Available", colorClass: "text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20" };
      case "ON_TRIP":
        return { text: "On Trip", colorClass: "text-[#4C8DFF] bg-[#4C8DFF]/10 border border-[#4C8DFF]/20" };
      case "IN_SHOP":
        return { text: "In Shop", colorClass: "text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20" };
      case "RETIRED":
        return { text: "Retired", colorClass: "text-[#E24B4A] bg-[#E24B4A]/10 border border-[#E24B4A]/20" };
      default:
        return { text: status, colorClass: "text-gray-500 bg-gray-50 border border-gray-100" };
    }
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

  // Search & filter logic
  const filteredVehicles = vehicles.filter((veh) => {
    if (searchReg && !veh.registrationNo.toLowerCase().includes(searchReg.toLowerCase())) {
      return false;
    }
    if (filterType !== "All" && veh.type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (filterStatus !== "All" && veh.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // Apply sorting
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let valA = a[sortBy] ?? "";
    let valB = b[sortBy] ?? "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Simulate file upload
  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadMsg("Saving certificate to database...");
    setTimeout(() => {
      setDocList([
        ...docList,
        { name: newDocType, expiry: "08/2027", status: "Active" },
      ]);
      setUploading(false);
      setUploadMsg("✓ Document registered successfully!");
      setTimeout(() => setUploadMsg(""), 3500);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading Vehicle Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Registry</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">Manage and track your operational fleet.</p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                registrationNo: "",
                name: "",
                type: "Truck",
                maxLoadCapacity: "",
                odometer: "0",
                acquisitionCost: "",
                status: "AVAILABLE",
              });
            }}
            className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Search & Filters Row */}
      <section className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-xs border border-gray-100/50 p-4 select-none">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Type</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-250/70 text-gray-700 font-bold rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:border-[#0F6B5C] cursor-pointer shadow-2xs min-w-[130px] transition-all"
          >
            <option value="All">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
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
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search Registry</span>
          <input
            type="text"
            placeholder="Search reg. no..."
            value={searchReg}
            onChange={(e) => setSearchReg(e.target.value)}
            className="bg-white border border-gray-250/70 text-gray-800 placeholder-gray-450 rounded-xl px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B5C]/20 focus:border-[#0F6B5C] transition-all w-52 shadow-2xs font-semibold"
          />
        </div>
      </section>

      {/* Add / Edit Form Modal Dialog */}
      {showForm && !isReadOnly && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-base font-extrabold text-gray-900">
                {editingId ? "Modify Vehicle" : "Register Fleet Asset"}
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
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reg. No (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. GJ01AB452"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Name/Model</label>
                  <input
                    type="text"
                    placeholder="e.g. VAN-05"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Load Capacity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: parseFloat(e.target.value) })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 74000"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseFloat(e.target.value) })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Acquisition Cost</label>
                  <input
                    type="number"
                    placeholder="e.g. 620000"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {editingId && (
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_TRIP">On Trip</option>
                    <option value="IN_SHOP">In Shop</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-[#0F6B5C] hover:bg-[#0c594c] text-white py-2.5 rounded-xl font-bold transition shadow-xs"
                >
                  {editingId ? "Save Modifications" : "Register Vehicle"}
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

      {/* Vehicles Table Card */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-gray-55 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th onClick={() => handleSort("registrationNo")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Reg. No. (Unique) {sortBy === "registrationNo" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("name")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Name/Model {sortBy === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("type")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Type {sortBy === "type" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("maxLoadCapacity")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Capacity {sortBy === "maxLoadCapacity" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("odometer")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Odometer {sortBy === "odometer" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("acquisitionCost")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Acq. Cost {sortBy === "acquisitionCost" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th onClick={() => handleSort("status")} className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  Status {sortBy === "status" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {sortedVehicles.length > 0 ? (
                sortedVehicles.map((vehicle) => {
                  const statusInfo = getStatusBadge(vehicle.status);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-55/35 transition-colors duration-150 font-semibold">
                      <td className="px-6 py-4 font-extrabold text-gray-900">
                        {vehicle.registrationNo}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {vehicle.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {vehicle.type}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {formatCapacity(vehicle.maxLoadCapacity)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {Math.round(vehicle.odometer).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-bold">
                        {Math.round(vehicle.acquisitionCost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${statusInfo.colorClass}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] space-x-2">
                        {!isReadOnly && (
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-[#0F6B5C] bg-[#0F6B5C]/5 border border-[#0F6B5C]/15 hover:bg-[#0F6B5C]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                          >
                            Modify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDocVehicleNo(vehicle.registrationNo);
                            setUploadMsg("");
                          }}
                          className="text-[#4C8DFF] bg-[#4C8DFF]/5 border border-[#4C8DFF]/15 hover:bg-[#4C8DFF]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                        >
                          Docs
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-[#E24B4A] bg-[#E24B4A]/5 border border-[#E24B4A]/15 hover:bg-[#E24B4A]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">
                    No registry records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rules & Regulations Caption */}
      <div className="px-1.5">
        <p className="text-[10px] text-amber-600 font-bold tracking-wide">
          Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
        </p>
      </div>

      {/* Vehicle Document Management Modal */}
      {docVehicleNo && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-6 text-xs select-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Document Manager</h3>
                <span className="text-[10px] font-bold text-gray-400">Registry records for vehicle {docVehicleNo}</span>
              </div>
              <button
                onClick={() => setDocVehicleNo(null)}
                className="text-gray-400 hover:text-gray-656 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of Mock Documents */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Active Vehicle Permits</span>
              {docList.map((doc, idx) => (
                <div key={idx} className="bg-gray-55 border border-gray-100 rounded-xl p-3 flex justify-between items-center font-bold">
                  <div className="space-y-0.5">
                    <span className="text-gray-800 block text-xs">{doc.name}</span>
                    <span className="text-[9px] text-gray-400 font-semibold">Expires: {doc.expiry}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20 px-2 py-0.5 rounded-lg">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Simulated upload form */}
            {!isReadOnly ? (
              <form onSubmit={handleSimulatedUpload} className="pt-4 border-t border-gray-100 space-y-4">
                <span className="text-[9px] font-black text-[#0F6B5C] uppercase tracking-widest block">Register Updated Permit</span>
                
                <div className="flex gap-2">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="flex-1 bg-[#F4F6F5] border border-transparent rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="Fitness Certificate">Fitness Certificate</option>
                    <option value="Pollution Under Control (PUC)">Pollution Under Control (PUC)</option>
                    <option value="Fleet Insurance Policy">Fleet Insurance Policy</option>
                    <option value="Road Permit Document">Road Permit Document</option>
                  </select>
                  
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-4 py-2 rounded-xl font-bold transition shadow-xs text-xs whitespace-nowrap"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>

                {uploadMsg && (
                  <div className={`text-[10px] font-bold ${uploadMsg.startsWith("✓") ? "text-[#2E9C7C]" : "text-gray-500 animate-pulse"}`}>
                    {uploadMsg}
                  </div>
                )}
              </form>
            ) : (
              <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                Note: Document uploads are restricted for your active role level.
              </div>
            )}

            <div className="bg-amber-50/50 border border-amber-250/30 rounded-xl p-3 text-[10px] text-amber-700 font-semibold leading-relaxed">
              Compliance Tip: Digital storage of active road permits is mandated by transportation guidelines.
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
