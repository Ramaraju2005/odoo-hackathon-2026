const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth");
const vehicleRoutes = require("../modules/vehicles");
const driverRoutes = require("../modules/drivers");
const tripRoutes = require("../modules/trips");
const maintenanceRoutes = require("../modules/maintenance");
const fuelRoutes = require("../modules/fuel");
const expenseRoutes = require("../modules/expenses");
const dashboardRoutes = require("../modules/dashboard");
const reportRoutes = require("../modules/reports");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TransitOps Backend Running 🚀",
  });
});

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/fuel", fuelRoutes);
router.use("/expenses", expenseRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);

module.exports = router;