const express = require("express");
const router = express.Router();
const controller = require("./maintenance.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/active/list", controller.getActiveMaintenance);
router.get("/vehicle/:vehicleId/cost", controller.getMaintenanceCostByVehicle);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.patch("/:id/close", controller.close);
router.delete("/:id", controller.delete);

module.exports = router;
