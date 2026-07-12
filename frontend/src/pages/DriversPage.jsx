import React, { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    licenseNo: "",
    licenseCategory: "LCV",
    licenseExpiryDate: "",
    contactNumber: "",
    safetyScore: "100",
  });

  useEffect(() => {
    fetchDrivers();
  }, [token]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await api.get(API_ENDPOINTS.DRIVERS_LIST, token);
      setDrivers(data);
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
        await api.put(API_ENDPOINTS.DRIVERS_UPDATE(editingId), formData, token);
      } else {
        await api.post(API_ENDPOINTS.DRIVERS_CREATE, formData, token);
      }
      fetchDrivers();
      setShowForm(false);
      setFormData({
        name: "",
        licenseNo: "",
        licenseCategory: "LCV",
        licenseExpiryDate: "",
        contactNumber: "",
        safetyScore: "100",
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      ...driver,
      licenseExpiryDate: new Date(driver.licenseExpiryDate).toISOString().split("T")[0],
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(API_ENDPOINTS.DRIVERS_DELETE(id), token);
        fetchDrivers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      AVAILABLE: "bg-green-100 text-green-800",
      ON_TRIP: "bg-blue-100 text-blue-800",
      OFF_DUTY: "bg-yellow-100 text-yellow-800",
      SUSPENDED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading drivers...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👤 Drivers</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              licenseNo: "",
              licenseCategory: "LCV",
              licenseExpiryDate: "",
              contactNumber: "",
              safetyScore: "100",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ New Driver"}
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
            {editingId ? "Edit Driver" : "Add New Driver"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="License No"
              value={formData.licenseNo}
              onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <select
              value={formData.licenseCategory}
              onChange={(e) =>
                setFormData({ ...formData, licenseCategory: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
            >
              <option>LCV</option>
              <option>HCV</option>
            </select>
            <input
              type="date"
              placeholder="License Expiry Date"
              value={formData.licenseExpiryDate}
              onChange={(e) =>
                setFormData({ ...formData, licenseExpiryDate: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="tel"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Safety Score"
              value={formData.safetyScore}
              onChange={(e) =>
                setFormData({ ...formData, safetyScore: parseFloat(e.target.value) })
              }
              className="border border-gray-300 px-3 py-2 rounded"
              min="0"
              max="100"
            />
            <button
              type="submit"
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update" : "Create"} Driver
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                License
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Expiry
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Safety Score
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
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                  {driver.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.licenseNo}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={
                      isLicenseExpired(driver.licenseExpiryDate)
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }
                  >
                    {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.safetyScore}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      driver.status
                    )}`}
                  >
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
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
