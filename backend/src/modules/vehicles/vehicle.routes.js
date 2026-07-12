const express = require("express");
const router = express.Router();
const controller = require("./vehicle.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/available/dispatch", controller.getAvailableForDispatch);
router.get("/:id", controller.getById);
router.get("/:id/fuel-efficiency", controller.getFuelEfficiency);
router.get("/:id/operational-cost", controller.getOperationalCost);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
