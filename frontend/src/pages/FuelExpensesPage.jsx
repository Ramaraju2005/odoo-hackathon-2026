import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiService";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export const FuelExpensesPage = () => {
  const { token } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals visibility
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form states
  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    liters: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [expenseForm, setExpenseForm] = useState({
    vehicleId: "",
    type: "TOLL",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    tripId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fuelData, expenseData, vehiclesData, tripsData] = await Promise.all([
        api.get(API_ENDPOINTS.FUEL_LIST, token),
        api.get(API_ENDPOINTS.EXPENSES_LIST, token),
        api.get(API_ENDPOINTS.VEHICLES_LIST, token),
        api.get(API_ENDPOINTS.TRIPS_LIST, token),
      ]);
      setFuelLogs(fuelData || []);
      setExpenses(expenseData || []);
      setVehicles(vehiclesData || []);
      setTrips(tripsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        API_ENDPOINTS.FUEL_CREATE,
        {
          ...fuelForm,
          liters: parseFloat(fuelForm.liters),
          cost: parseFloat(fuelForm.cost),
          date: new Date(fuelForm.date).toISOString(),
        },
        token
      );
      fetchData();
      setShowFuelModal(false);
      setFuelForm({
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
      // If a trip is selected, we prepend it to the description
      let desc = expenseForm.description;
      if (expenseForm.tripId) {
        const matchingTrip = trips.find((t) => String(t.id) === String(expenseForm.tripId));
        const tripLabel = matchingTrip ? `TR${String(matchingTrip.id).padStart(3, "0")}` : "";
        desc = tripLabel ? `[Linked to ${tripLabel}] ${desc}`.trim() : desc;
      }

      await api.post(
        API_ENDPOINTS.EXPENSES_CREATE,
        {
          vehicleId: expenseForm.vehicleId,
          type: expenseForm.type,
          amount: parseFloat(expenseForm.amount),
          description: desc,
          date: new Date(expenseForm.date).toISOString(),
        },
        token
      );
      fetchData();
      setShowExpenseModal(false);
      setExpenseForm({
        vehicleId: "",
        type: "TOLL",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        tripId: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFuel = async (id) => {
    if (confirm("Are you sure you want to delete this fuel record?")) {
      try {
        await api.delete(API_ENDPOINTS.FUEL_DELETE(id), token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      try {
        await api.delete(API_ENDPOINTS.EXPENSES_DELETE(id), token);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Calculations for Footer Sums
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Total Operational Cost (Fuel + Expenses)
  const grandTotalCost = totalFuelCost + totalExpenseCost;

  // Formatting date for mockup: e.g. "05 Jul 2026"
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Helper to extract linked Trip ID from description e.g. "[Linked to TR001]"
  const getLinkedTripId = (description) => {
    if (!description) return "-";
    const match = description.match(/\[Linked to (TR\d+)\]/);
    return match ? match[1] : "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#F4F6F5]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-[#0F6B5C]">⏳</div>
          <p className="text-gray-500 font-semibold text-sm">Loading Operational Expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F6F5] min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fuel & Expense Management</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Track fuel logs, tolls, maintenance costs, and operational totals.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#E24B4A] rounded-xl p-4 text-xs font-bold shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Fuel Logs Section Card */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center select-none">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Fuel Logs</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Logs of petroleum/diesel refills across operational vehicles.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFuelModal(true)}
              className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              + Log Fuel
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-[#0F6B5C] hover:bg-[#0c594c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Fuel logs table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Liters</th>
                <th className="px-6 py-3">Fuel Cost</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {fuelLogs.length > 0 ? (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition font-semibold">
                    <td className="px-6 py-3.5 font-extrabold text-gray-900">
                      {log.vehicle?.registrationNo}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 font-bold">
                      {formatDateDisplay(log.date)}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 font-bold">
                      {log.liters} L
                    </td>
                    <td className="px-6 py-3.5 text-gray-900 font-extrabold">
                      ₹{Math.round(log.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteFuel(log.id)}
                        className="text-[#E24B4A] hover:underline text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No fuel refills logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Other Expenses (Toll / Misc) Section Card */}
      <section className="bg-white rounded-2xl border border-gray-100/50 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Other Expenses (Toll / Misc)</h2>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Logs of tolls, maintenance tasks, and additional logistics charges.</p>
        </div>

        {/* Expenses table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Trip</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Toll</th>
                <th className="px-6 py-3">Other</th>
                <th className="px-6 py-3">Maint. (Linked)</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {expenses.length > 0 ? (
                expenses.map((exp) => {
                  const linkedTrip = getLinkedTripId(exp.description);
                  const isToll = exp.type === "TOLL";
                  const isMaint = exp.type === "MAINTENANCE";
                  const isOther = exp.type === "OTHER" || exp.type === "FUEL";

                  return (
                    <tr key={exp.id} className="hover:bg-gray-50/50 transition font-semibold">
                      <td className="px-6 py-3.5 font-bold text-gray-500">
                        {linkedTrip}
                      </td>
                      <td className="px-6 py-3.5 font-extrabold text-gray-950">
                        {exp.vehicle?.registrationNo}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 font-bold">
                        {isToll ? `₹${Math.round(exp.amount).toLocaleString()}` : "0"}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 font-bold">
                        {isOther ? `₹${Math.round(exp.amount).toLocaleString()}` : "0"}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 font-bold">
                        {isMaint ? `₹${Math.round(exp.amount).toLocaleString()}` : "0"}
                      </td>
                      <td className="px-6 py-3.5 text-gray-900 font-extrabold">
                        ₹{Math.round(exp.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-[#E24B4A] hover:underline text-[10px] font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No misc or toll expenses logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grand Auto Total Operational Footer */}
      <section className="bg-white rounded-2xl border-t border-gray-100 shadow-xs p-5 flex justify-between items-center select-none font-bold">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
          TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT + EXPENSES
        </span>
        <span className="text-xl text-amber-600 font-black tracking-tight">
          ₹{Math.round(grandTotalCost).toLocaleString()}
        </span>
      </section>

      {/* Log Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-5 space-y-5 text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Log Fuel Purchase</h3>
              <button onClick={() => setShowFuelModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleFuelSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle</label>
                <select
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNo} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Liters (L)</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={fuelForm.liters}
                  onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cost (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 3150"
                  value={fuelForm.cost}
                  onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={fuelForm.date}
                  onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" className="flex-1 bg-[#0F6B5C] hover:bg-[#0c594c] text-white py-2.5 rounded-xl font-bold transition">Save Fuel Log</button>
                <button type="button" onClick={() => setShowFuelModal(false)} className="flex-1 bg-gray-50 border border-gray-250/70 text-gray-700 py-2.5 rounded-xl font-bold transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-5 space-y-5 text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Add Operational Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle</label>
                <select
                  value={expenseForm.vehicleId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNo} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1"
                  >
                    <option value="TOLL">Toll</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 340"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Link to Trip (Optional)</label>
                <select
                  value={expenseForm.tripId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1"
                >
                  <option value="">Unassigned</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      TR{String(t.id).padStart(3, "0")} ({t.source} ➔ {t.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Expressway Toll"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full bg-[#F4F6F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F6B5C]/35 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" className="flex-1 bg-[#0F6B5C] hover:bg-[#0c594c] text-white py-2.5 rounded-xl font-bold transition">Save Expense</button>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 bg-gray-50 border border-gray-250/70 text-gray-700 py-2.5 rounded-xl font-bold transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
