const express = require("express");
const router = express.Router();
const controller = require("./driver.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/available/dispatch", controller.getAvailableForDispatch);
router.get("/licenses/expired", controller.getExpiredLicenses);
router.get("/licenses/expiring", controller.getExpiringLicenses);
router.get("/:id", controller.getById);
router.get("/:id/license-validity", controller.checkLicenseValidity);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
