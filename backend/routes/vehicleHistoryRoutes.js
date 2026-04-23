const express = require("express");
const router = express.Router();
const VehicleHistory = require("../models/VehicleHistory");

router.get("/", async (req, res) => {
  try {
    const data = await VehicleHistory.find()
      .sort({ timestamp: -1 })
      .limit(20);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;