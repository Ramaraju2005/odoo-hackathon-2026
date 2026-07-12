import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const TripsPage = () => {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Trip creation form state
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    source: "",
    destination: "",
    cargoWeight: "",
    plannedDistance: "",
  });

  // Completion modal state
  const [completingTripId, setCompletingTripId] = useState(null);
  const [completeInputs, setCompleteInputs] = useState({
    actualDistance: "",
    fuelConsumed: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        api.get(API_ENDPOINTS.TRIPS_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_AVAILABLE, token),
        api.get(API_ENDPOINTS.DRIVERS_AVAILABLE, token),
      ]);
      setTrips(tripsData || []);
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form capacity validation checks
  const selectedVehicle = vehicles.find((v) => String(v.id) === String(formData.vehicleId));
  const cargoWeightNum = parseFloat(formData.cargoWeight || 0);
  const isWeightExceeded = selectedVehicle && cargoWeightNum > selectedVehicle.maxLoadCapacity;
  const weightOverLimit = selectedVehicle ? Math.max(0, cargoWeightNum - selectedVehicle.maxLoadCapacity) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isWeightExceeded) return; // Prevent submission if exceeded

    try {
      await api.post(
        API_ENDPOINTS.TRIPS_CREATE,
        {
          ...formData,
          cargoWeight: parseFloat(formData.cargoWeight),
          plannedDistance: parseFloat(formData.plannedDistance),
        },
        token
      );
      fetchData();
      setFormData({
        vehicleId: "",
        driverId: "",
        source: "",
        destination: "",
        cargoWeight: "",
        plannedDistance: "",
      });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDispatch = async (tripId) => {
    try {
      await api.patch(API_ENDPOINTS.TRIPS_DISPATCH(tripId), {}, token);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    const actualDist = parseFloat(completeInputs.actualDistance);
    const fuelCons = parseFloat(completeInputs.fuelConsumed);

    if (isNaN(actualDist) || isNaN(fuelCons)) {
      setError("Please fill in valid actual distance and fuel consumed");
      return;
    }

    try {
      await api.patch(
        API_ENDPOINTS.TRIPS_COMPLETE(completingTripId),
        {
          actualDistance: actualDist,
          fuelConsumed: fuelCons,
        },
        token
      );
      setCompletingTripId(null);
      setCompleteInputs({ actualDistance: "", fuelConsumed: "" });
      fetchData();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (tripId) => {
    if (confirm("Are you sure you want to cancel this trip?")) {
      try {
        await api.patch(API_ENDPOINTS.TRIPS_CANCEL(tripId), {}, token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Pad Trip IDs for mockup style e.g. TR001
  const getTripDisplayId = (id) => {
    return `TR${String(id).padStart(3, "0")}`;
  };

  // Status badges config
  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return "text-[#64748B] bg-[#64748B]/10 border border-[#64748B]/20";
      case "DISPATCHED":
        return "text-[#4C8DFF] bg-[#4C8DFF]/10 border border-[#4C8DFF]/20";
      case "COMPLETED":
        return "text-[#2E9C7C] bg-[#2E9C7C]/10 border border-[#2E9C7C]/20";
      case "CANCELLED":
        return "text-[#E24B4A] bg-[#E24B4A]/10 border border-[#E24B4A]/20";
      default:
        return "text-gray-500 bg-gray-50 border border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading Trip Dispatcher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trip Dispatcher</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Dispatch vehicle tasks and monitor live operations.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid: Create Trip (Left) & Live Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Side: Create Trip Card */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-5">
          
          {/* Trip Lifecycle Dot Tracker */}
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Trip Lifecycle</span>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 relative px-2 select-none">
              {/* Connector line */}
              <div className="absolute top-[5px] left-8 right-8 h-[2px] bg-gray-100 z-0"></div>
              
              <div className="flex flex-col items-center z-10 space-y-1">
                <span className="w-3 h-3 rounded-full bg-[#2E9C7C] border-2 border-white ring-1 ring-offset-0 ring-[#2E9C7C]"></span>
                <span className="text-[#2E9C7C]">Draft</span>
              </div>
              <div className="flex flex-col items-center z-10 space-y-1">
                <span className="w-3 h-3 rounded-full bg-[#4C8DFF] border-2 border-white ring-1 ring-offset-0 ring-[#4C8DFF]"></span>
                <span className="text-[#4C8DFF]">Dispatched</span>
              </div>
              <div className="flex flex-col items-center z-10 space-y-1">
                <span className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white ring-1 ring-offset-0 ring-gray-300"></span>
                <span>Completed</span>
              </div>
              <div className="flex flex-col items-center z-10 space-y-1">
                <span className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white ring-1 ring-offset-0 ring-gray-300"></span>
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Create Trip</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Source</label>
                <input
                  type="text"
                  placeholder="e.g. Gandhinagar Depot"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad Hub"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle (Available Only)</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNo} - {v.name} ({v.maxLoadCapacity} kg capacity)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Driver (Available Only)</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all"
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (License: {d.licenseNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 700"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Planned Distance (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 38"
                    value={formData.plannedDistance}
                    onChange={(e) => setFormData({ ...formData, plannedDistance: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Capacity Exceeded Warning Box */}
              {selectedVehicle && isWeightExceeded && (
                <div className="bg-[#E24B4A]/5 border border-[#E24B4A]/25 rounded-xl p-3.5 text-[11px] font-bold text-[#E24B4A] space-y-1">
                  <div>Vehicle Capacity: {selectedVehicle.maxLoadCapacity} kg</div>
                  <div>Cargo Weight: {cargoWeightNum} kg</div>
                  <div>❌ Capacity exceeded by {weightOverLimit} kg — dispatch blocked</div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isWeightExceeded}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition shadow-xs text-center ${
                    isWeightExceeded
                      ? "bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-[#0F6B5C] hover:bg-[#0c594c] text-white"
                  }`}
                >
                  {isWeightExceeded ? "Dispatch (disabled)" : "Dispatch"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      vehicleId: "",
                      driverId: "",
                      source: "",
                      destination: "",
                      cargoWeight: "",
                      plannedDistance: "",
                    })
                  }
                  className="bg-gray-50 border border-gray-250/70 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </section>

        {/* Right Side: Live Board List */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center select-none">
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Live Board</h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Real-time status tracking of all registered dispatches.</p>
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-md">
              {trips.length} active
            </span>
          </div>

          {/* Cards List container */}
          <div className="space-y-4">
            {trips.length > 0 ? (
              trips.map((trip) => {
                const statusBadgeClass = getStatusBadge(trip.status);
                
                // Set custom details depending on status
                let subtext = "";
                if (trip.status === "DISPATCHED") {
                  subtext = `${trip.plannedDistance} km planned distance`;
                } else if (trip.status === "DRAFT") {
                  subtext = "Awaiting vehicle dispatch";
                } else if (trip.status === "CANCELLED") {
                  subtext = "Trip cancelled before delivery";
                } else if (trip.status === "COMPLETED") {
                  subtext = `Delivered in ${trip.actualDistance} km • Consumed ${trip.fuelConsumed} L`;
                }

                return (
                  <div
                    key={trip.id}
                    className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-2xs hover:border-gray-200 transition-all duration-150"
                  >
                    <div className="space-y-1.5 flex-1">
                      {/* ID and Asset info */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900 tracking-wider">
                          {getTripDisplayId(trip.id)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          • {trip.vehicle?.registrationNo} / {trip.driver?.name}
                        </span>
                      </div>
                      
                      {/* Source/Destination route */}
                      <div className="text-xs font-extrabold text-gray-800">
                        {trip.source} ➔ {trip.destination}
                      </div>
                      
                      {/* Status comments */}
                      <div className="text-[10px] text-gray-400 font-semibold">
                        {subtext}
                      </div>
                    </div>

                    {/* Badge and action buttons */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 w-full md:w-auto">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${statusBadgeClass}`}>
                        {trip.status}
                      </span>
                      
                      <div className="flex gap-2">
                        {trip.status === "DRAFT" && (
                          <button
                            onClick={() => handleDispatch(trip.id)}
                            className="text-[#4C8DFF] bg-[#4C8DFF]/5 border border-[#4C8DFF]/15 hover:bg-[#4C8DFF]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                          >
                            Dispatch
                          </button>
                        )}
                        {trip.status === "DISPATCHED" && (
                          <button
                            onClick={() => {
                              setCompletingTripId(trip.id);
                              setCompleteInputs({ actualDistance: "", fuelConsumed: "" });
                            }}
                            className="text-[#2E9C7C] bg-[#2E9C7C]/5 border border-[#2E9C7C]/15 hover:bg-[#2E9C7C]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                          >
                            Complete
                          </button>
                        )}
                        {["DRAFT", "DISPATCHED"].includes(trip.status) && (
                          <button
                            onClick={() => handleCancel(trip.id)}
                            className="text-[#E24B4A] bg-[#E24B4A]/5 border border-[#E24B4A]/15 hover:bg-[#E24B4A]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-400 font-medium text-xs">
                No active dispatches on the live board.
              </div>
            )}
          </div>

          {/* Under Legend Info */}
          <div className="pt-2 border-t border-gray-50">
            <p className="text-[9px] text-gray-400 font-semibold italic">
              On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
            </p>
          </div>
        </section>

      </div>

      {/* Complete Trip Overlay Modal */}
      {completingTripId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Complete Dispatch {getTripDisplayId(completingTripId)}
              </h3>
              <button
                onClick={() => setCompletingTripId(null)}
                className="text-gray-400 hover:text-gray-655 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-450 uppercase tracking-wider mb-1">Actual Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 38"
                  value={completeInputs.actualDistance}
                  onChange={(e) => setCompleteInputs({ ...completeInputs, actualDistance: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-455 uppercase tracking-wider mb-1">Fuel Consumed (Liters)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={completeInputs.fuelConsumed}
                  onChange={(e) => setCompleteInputs({ ...completeInputs, fuelConsumed: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0F6B5C] hover:bg-[#0c594c] text-white py-2.5 rounded-xl font-bold transition shadow-xs text-center"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  onClick={() => setCompletingTripId(null)}
                  className="flex-1 bg-gray-50 border border-gray-250/70 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold transition text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
