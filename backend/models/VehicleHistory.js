const mongoose = require("mongoose");

const vehicleHistorySchema = new mongoose.Schema({
  rfid: {
    type: String,
    required: true,
  },
  slotNumber: {
    type: Number,
    default: 1,
  },
  gateStatus: {
    type: String,
    default: "open",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("VehicleHistory", vehicleHistorySchema);