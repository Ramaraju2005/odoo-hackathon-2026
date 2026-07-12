const express = require("express");
const router = express.Router();
const controller = require("./report.controller");

router.get("/fuel-efficiency", controller.getFuelEfficiencyReport);
router.get("/fleet-utilization", controller.getFleetUtilizationReport);
router.get("/operational-cost", controller.getOperationalCostReport);
router.get("/vehicle-roi", controller.getVehicleROIReport);
router.get("/trips", controller.getTripsReport);
router.get("/maintenance", controller.getMaintenanceReport);
router.get("/export/:reportType", controller.exportToCSV);

module.exports = router;
