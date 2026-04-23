const express = require("express");
const router = express.Router();
const Slot = require("../models/slot");

// GET all current slot states
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one slot by slot number
router.get("/:slotNumber", async (req, res) => {
  try {
    const slot = await Slot.findOne({ slotNumber: req.params.slotNumber });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;