const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  rfid: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  owner: {
    type: String,
    default: "New User"
  },
  vehicleNumber: {
    type: String,
    default: "TEMP"
  },
  accessType: {
    type: String,
    default: "REGISTERED"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);