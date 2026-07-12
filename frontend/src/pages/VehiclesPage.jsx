import React, { useState, useEffect } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS, STATUSES } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const VehiclesPage = () => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    registrationNo: "",
    name: "",
    type: "Truck",
    maxLoadCapacity: "",
    odometer: "0",
    acquisitionCost: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.get(API_ENDPOINTS.VEHICLES_LIST, token);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(API_ENDPOINTS.VEHICLES_DELETE(id), token);
        fetchVehicles();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      AVAILABLE: "bg-green-100 text-green-800",
      ON_TRIP: "bg-blue-100 text-blue-800",
      IN_SHOP: "bg-yellow-100 text-yellow-800",
      RETIRED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🚗 Vehicles</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              registrationNo: "",
              name: "",
              type: "Truck",
              maxLoadCapacity: "",
              odometer: "0",
              acquisitionCost: "",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ New Vehicle"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">
            {editingId ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Registration No"
              value={formData.registrationNo}
              onChange={(e) =>
                setFormData({ ...formData, registrationNo: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Vehicle Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Max Load Capacity (kg)"
              value={formData.maxLoadCapacity}
              onChange={(e) =>
                setFormData({ ...formData, maxLoadCapacity: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Odometer"
              value={formData.odometer}
              onChange={(e) =>
                setFormData({ ...formData, odometer: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Acquisition Cost"
              value={formData.acquisitionCost}
              onChange={(e) =>
                setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update" : "Create"} Vehicle
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Registration
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Capacity
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
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                  {vehicle.registrationNo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{vehicle.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{vehicle.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {vehicle.maxLoadCapacity} kg
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
