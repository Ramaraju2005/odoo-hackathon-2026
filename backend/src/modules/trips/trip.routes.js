const express = require("express");
const router = express.Router();
const controller = require("./trip.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/active/list", controller.getActiveTrips);
router.get("/pending/list", controller.getPendingTrips);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.patch("/:id/dispatch", controller.dispatch);
router.patch("/:id/complete", controller.complete);
router.patch("/:id/cancel", controller.cancel);

module.exports = router;
