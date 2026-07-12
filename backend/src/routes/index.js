const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TransitOps Backend Running 🚀",
  });
});

router.use("/auth", authRoutes);

module.exports = router;