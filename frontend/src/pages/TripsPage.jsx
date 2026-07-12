import React, { useState, useEffect } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const TripsPage = () => {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    source: "",
    destination: "",
    cargoWeight: "",
    plannedDistance: "",
  });
  const [completeData, setCompleteData] = useState({});

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        api.get(API_ENDPOINTS.TRIPS_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_AVAILABLE, token),
        api.get(API_ENDPOINTS.DRIVERS_AVAILABLE, token),
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_ENDPOINTS.TRIPS_CREATE, formData, token);
      fetchData();
      setShowForm(false);
      setFormData({
        vehicleId: "",
        driverId: "",
        source: "",
        destination: "",
        cargoWeight: "",
        plannedDistance: "",
      });
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

  const handleComplete = async (tripId) => {
    const data = completeData[tripId];
    if (!data || !data.actualDistance || !data.fuelConsumed) {
      setError("Please fill in actual distance and fuel consumed");
      return;
    }
    try {
      await api.patch(API_ENDPOINTS.TRIPS_COMPLETE(tripId), data, token);
      fetchData();
      setCompleteData({});
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (tripId) => {
    if (confirm("Are you sure?")) {
      try {
        await api.patch(API_ENDPOINTS.TRIPS_CANCEL(tripId), {}, token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      DISPATCHED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🛣️ Trips</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormData({
              vehicleId: "",
              driverId: "",
              source: "",
              destination: "",
              cargoWeight: "",
              plannedDistance: "",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ New Trip"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Create New Trip</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNo} - {v.name}
                </option>
              ))}
            </select>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            >
              <option value="">Select Driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - {d.licenseNo}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Cargo Weight (kg)"
              value={formData.cargoWeight}
              onChange={(e) =>
                setFormData({ ...formData, cargoWeight: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Planned Distance (km)"
              value={formData.plannedDistance}
              onChange={(e) =>
                setFormData({ ...formData, plannedDistance: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Trip
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Route
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                  {trip.vehicle?.registrationNo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {trip.driver?.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {trip.source} → {trip.destination}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {trip.cargoWeight} kg
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      trip.status
                    )}`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {trip.status === "DRAFT" && (
                    <button
                      onClick={() => handleDispatch(trip.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Dispatch
                    </button>
                  )}
                  {trip.status === "DISPATCHED" && (
                    <>
                      <button
                        onClick={() => {
                          const data = prompt(
                            `Actual Distance (km):`
                          );
                          if (data) {
                            const fuel = prompt("Fuel Consumed (liters):");
                            if (fuel) {
                              handleComplete(trip.id);
                              setCompleteData({
                                ...completeData,
                                [trip.id]: {
                                  actualDistance: parseFloat(data),
                                  fuelConsumed: parseFloat(fuel),
                                },
                              });
                            }
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {["DRAFT", "DISPATCHED"].includes(trip.status) && (
                    <button
                      onClick={() => handleCancel(trip.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
