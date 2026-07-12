const express = require("express");
const router = express.Router();
const controller = require("./expense.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/vehicle/:vehicleId/expenses", controller.getExpensesByVehicle);
router.get("/type/:type/expenses", controller.getExpensesByType);
router.get("/vehicle/:vehicleId/operational-cost", controller.getTotalOperationalCost);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
