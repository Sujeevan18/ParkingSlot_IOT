const mongoose = require("mongoose");

const slotHistorySchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["FREE", "OCCUPIED"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SlotHistory", slotHistorySchema);