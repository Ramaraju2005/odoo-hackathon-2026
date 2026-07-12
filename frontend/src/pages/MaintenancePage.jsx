import React, { useState, useEffect } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const MaintenancePage = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    cost: "",
    startDate: "",
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsData, vehiclesData] = await Promise.all([
        api.get(API_ENDPOINTS.MAINTENANCE_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_LIST, token),
      ]);
      setRecords(recordsData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        API_ENDPOINTS.MAINTENANCE_CREATE,
        {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
        },
        token
      );
      fetchData();
      setShowForm(false);
      setFormData({
        vehicleId: "",
        description: "",
        cost: "",
        startDate: "",
      });
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
    if (confirm("Are you sure?")) {
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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading maintenance records...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🔧 Maintenance</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormData({
              vehicleId: "",
              description: "",
              cost: "",
              startDate: "",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ New Maintenance"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Create Maintenance Record</h2>
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
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Cost"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Record
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
                Description
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                  {record.vehicle?.registrationNo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {record.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ₹{record.cost.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(record.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {record.endDate
                    ? new Date(record.endDate).toLocaleDateString()
                    : "In Progress"}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {!record.endDate && (
                    <button
                      onClick={() => handleClose(record.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(record.id)}
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
