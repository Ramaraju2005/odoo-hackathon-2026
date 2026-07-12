const express = require("express");
const router = express.Router();
const controller = require("./dashboard.controller");

router.get("/kpis", controller.getKPIs);
router.get("/fleet-stats", controller.getFleetStats);
router.get("/recent-trips", controller.getRecentTrips);
router.get("/activity-timeline", controller.getActivityTimeline);
router.get("/operational-costs", controller.getOperationalCosts);

module.exports = router;
