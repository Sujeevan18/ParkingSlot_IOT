const express = require("express");
const router = express.Router();
const SlotHistory = require("../models/SlotHistory");

// Get latest slot history records
router.get("/", async (req, res) => {
  try {
    const data = await SlotHistory.find()
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get slot history by slot number
router.get("/:slotNumber", async (req, res) => {
  try {
    const data = await SlotHistory.find({ slotNumber: req.params.slotNumber })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;