const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
    unique: true
  },
  irStatus: {
    type: String,
    default: "UNKNOWN"
  },
  ultrasonicStatus: {
    type: String,
    default: "UNKNOWN"
  },
  status: {
    type: String,
    default: "FREE"
  },
  distance: {
    type: Number,
    default: -1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Slot", slotSchema);