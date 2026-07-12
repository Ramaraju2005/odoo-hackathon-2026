import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const MaintenancePage = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Get today's date formatted as YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    cost: "",
    startDate: getTodayString(),
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsData, vehiclesData] = await Promise.all([
        api.get(API_ENDPOINTS.MAINTENANCE_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_LIST, token),
      ]);
      setRecords(recordsData || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        API_ENDPOINTS.MAINTENANCE_CREATE,
        {
          ...formData,
          cost: parseFloat(formData.cost),
          startDate: new Date(formData.startDate).toISOString(),
        },
        token
      );
      fetchData();
      setFormData({
        vehicleId: "",
        description: "",
        cost: "",
        startDate: getTodayString(),
      });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async (recordId) => {
    try {
      await api.patch(API_ENDPOINTS.MAINTENANCE_CLOSE(recordId), {}, token);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        await api.delete(API_ENDPOINTS.MAINTENANCE_DELETE(id), token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading Maintenance Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Maintenance Logs</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Schedule and review fleet repairs, servicing, and cost breakdowns.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Side: Log Service Record Form */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-5">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Log Service Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNo} - {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service Type</label>
                <input
                  type="text"
                  placeholder="e.g. Oil Change, Engine Repair"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cost</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                <input
                  type="text"
                  value="Active"
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-450 font-bold select-none cursor-not-allowed"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#E5981E] hover:bg-[#c98317] text-white py-2.5 rounded-xl font-bold transition shadow-xs text-center uppercase tracking-wider"
              >
                Save
              </button>

            </form>
          </div>

          {/* Visual Status Transition Flow Graphic */}
          <div className="pt-4 border-t border-gray-100 select-none space-y-3.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Status Transitions</span>
            
            <div className="space-y-3 text-[11px] font-bold">
              {/* Step 1: Available to In Shop */}
              <div className="flex items-center justify-between text-gray-655 bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                <span className="text-[#2E9C7C]">Available</span>
                <span className="text-gray-400 font-normal">creating active record ➔</span>
                <span className="text-[#F5A623]">In Shop</span>
              </div>
              
              {/* Step 2: In Shop to Available */}
              <div className="flex items-center justify-between text-gray-655 bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                <span className="text-[#F5A623]">In Shop</span>
                <span className="text-gray-400 font-normal">closing record (returned) ➔</span>
                <span className="text-[#2E9C7C]">Available</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-600 font-semibold leading-relaxed">
              Note: In Shop vehicles are removed from the dispatch pool.
            </p>
          </div>
        </section>

        {/* Right Side: Service Log Table */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center select-none">
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Service Log</h2>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Historical logs of all active and completed garage maintenance.</p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-md">
                {records.length} records
              </span>
            </div>

            {/* Service Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3.5">Vehicle</th>
                    <th className="px-4 py-3.5">Service</th>
                    <th className="px-4 py-3.5">Cost</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {records.length > 0 ? (
                    records.map((rec) => {
                      const isOpen = !rec.endDate;
                      return (
                        <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors duration-150 font-semibold">
                          <td className="px-4 py-4 font-extrabold text-gray-900">
                            {rec.vehicle?.registrationNo}
                            <span className="block text-[9px] font-semibold text-gray-400 mt-0.5">{rec.vehicle?.name}</span>
                          </td>
                          <td className="px-4 py-4 text-gray-800">
                            {rec.description}
                            <span className="block text-[9px] font-semibold text-gray-450 mt-0.5">
                              Started: {new Date(rec.startDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-900 font-bold">
                            ₹{Math.round(rec.cost).toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            {isOpen ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20">
                                In Shop
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20">
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[10px] space-x-2">
                            {isOpen && (
                              <button
                                onClick={() => handleClose(rec.id)}
                                className="text-[#2E9C7C] bg-[#2E9C7C]/5 border border-[#2E9C7C]/15 hover:bg-[#2E9C7C]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                              >
                                Close
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(rec.id)}
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
                      <td colSpan="5" className="px-4 py-12 text-center text-gray-400 font-medium">
                        No maintenance log records saved.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};
