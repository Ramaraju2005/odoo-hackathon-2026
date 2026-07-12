import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { DriversPage } from "./pages/DriversPage";
import { TripsPage } from "./pages/TripsPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { FuelExpensesPage } from "./pages/FuelExpensesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import "./App.css";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VehiclesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DriversPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TripsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MaintenancePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/fuel"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FuelExpensesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}