import React, { useState, useEffect } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const FuelExpensesPage = () => {
  const { token } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [error, setError] = useState("");
  const [fuelData, setFuelData] = useState({
    vehicleId: "",
    liters: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [expenseData, setExpenseData] = useState({
    vehicleId: "",
    type: "TOLL",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fuelData, expenseData, vehiclesData] = await Promise.all([
        api.get(API_ENDPOINTS.FUEL_LIST, token),
        api.get(API_ENDPOINTS.EXPENSES_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_LIST, token),
      ]);
      setFuelLogs(fuelData);
      setExpenses(expenseData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_ENDPOINTS.FUEL_CREATE, fuelData, token);
      fetchData();
      setShowFuelForm(false);
      setFuelData({
        vehicleId: "",
        liters: "",
        cost: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_ENDPOINTS.EXPENSES_CREATE, expenseData, token);
      fetchData();
      setShowExpenseForm(false);
      setExpenseData({
        vehicleId: "",
        type: "TOLL",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFuel = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(API_ENDPOINTS.FUEL_DELETE(id), token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(API_ENDPOINTS.EXPENSES_DELETE(id), token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">⛽ Fuel & Expenses</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Fuel Logs */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Fuel Logs</h2>
          <button
            onClick={() => setShowFuelForm(!showFuelForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {showFuelForm ? "Cancel" : "+ Add Fuel Log"}
          </button>
        </div>

        {showFuelForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleFuelSubmit} className="grid grid-cols-2 gap-4">
              <select
                value={fuelData.vehicleId}
                onChange={(e) => setFuelData({ ...fuelData, vehicleId: e.target.value })}
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
                type="number"
                placeholder="Liters"
                value={fuelData.liters}
                onChange={(e) => setFuelData({ ...fuelData, liters: parseFloat(e.target.value) })}
                className="border border-gray-300 px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Cost"
                value={fuelData.cost}
                onChange={(e) => setFuelData({ ...fuelData, cost: parseFloat(e.target.value) })}
                className="border border-gray-300 px-3 py-2 rounded"
                required
              />
              <input
                type="date"
                value={fuelData.date}
                onChange={(e) => setFuelData({ ...fuelData, date: e.target.value })}
                className="border border-gray-300 px-3 py-2 rounded"
                required
              />
              <button
                type="submit"
                className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Add Fuel Log
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
                  Liters
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                    {log.vehicle?.registrationNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.liters} L</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ₹{log.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteFuel(log.id)}
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
      </section>

      {/* Expenses */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {showExpenseForm ? "Cancel" : "+ Add Expense"}
          </button>
        </div>

        {showExpenseForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleExpenseSubmit} className="grid grid-cols-2 gap-4">
              <select
                value={expenseData.vehicleId}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, vehicleId: e.target.value })
                }
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
                value={expenseData.type}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, type: e.target.value })
                }
                className="border border-gray-300 px-3 py-2 rounded"
              >
                <option>FUEL</option>
                <option>TOLL</option>
                <option>MAINTENANCE</option>
                <option>OTHER</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={expenseData.amount}
                onChange={(e) =>
                  setExpenseData({
                    ...expenseData,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="border border-gray-300 px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={expenseData.description}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, description: e.target.value })
                }
                className="border border-gray-300 px-3 py-2 rounded"
              />
              <input
                type="date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                className="border border-gray-300 px-3 py-2 rounded col-span-2"
                required
              />
              <button
                type="submit"
                className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Add Expense
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                    {expense.vehicle?.registrationNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
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
      </section>
    </div>
  );
};
