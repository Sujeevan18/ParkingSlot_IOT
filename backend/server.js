require("dotenv").config({ path: "../.env" });

const mqtt = require("mqtt");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Vehicle = require("./models/vehicle");
const Slot = require("./models/slot");
const Alert = require("./models/alert");
const SlotHistory = require("./models/SlotHistory");
const VehicleHistory = require("./models/VehicleHistory");


const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;

let isMongoReady = false;
let latestGateStatus = "closed";

// -------- ROUTES --------
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/slot-history", require("./routes/slotHistoryRoutes"));
app.use("/api/vehicle-history", require("./routes/vehicleHistoryRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// -------- TEST ROUTE --------
app.get("/", (req, res) => {
  res.send("Smart Parking Backend Running");
});

// -------- CONNECT MONGODB --------
async function connectMongo() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing. Check your .env file.");
    }

    await mongoose.connect(MONGO_URI, {
      dbName: "parkingDB",
      serverSelectionTimeoutMS: 10000,
    });

    isMongoReady = true;
    console.log("MongoDB Connected");
    console.log("Database Name:", mongoose.connection.name);
    console.log("Ready State:", mongoose.connection.readyState);
  } catch (err) {
    isMongoReady = false;
    console.error("MongoDB Connection Error:", err.message);
  }
}

mongoose.connection.on("connected", () => {
  isMongoReady = true;
  console.log("MongoDB event: connected");
});

mongoose.connection.on("error", (err) => {
  isMongoReady = false;
  console.error("MongoDB Runtime Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  isMongoReady = false;
  console.log("MongoDB event: disconnected");
});

// -------- MQTT --------
const client = mqtt.connect("mqtt://broker.hivemq.com", {
  reconnectPeriod: 2000,
});

client.on("connect", () => {
  console.log("MQTT Connected");

  const topics = [
    "parking/rfid",
    "parking/slot",
    "parking/smoke",
    "parking/gate/status",
  ];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.log(`Subscribe error [${topic}]: ${err.message}`);
      } else {
        console.log(`Subscribed to ${topic}`);
      }
    });
  });
});

client.on("error", (err) => {
  console.log("MQTT Error:", err.message);
});

// -------- MQTT MESSAGE HANDLER --------
client.on("message", async (topic, message) => {
  const msg = message.toString();
  console.log(`Received [${topic}] -> ${msg}`);

  if (!isMongoReady || mongoose.connection.readyState !== 1) {
    console.log("MongoDB not ready. Skipping DB operation.");
    return;
  }

  try {
    // -------- RFID --------
    if (topic === "parking/rfid") {
      const rfid = msg.trim().toUpperCase();
      console.log("Scanned RFID:", rfid);

      if (!rfid) {
        console.log("Empty RFID received");
        client.publish("parking/gate/control", "DENY");
        return;
      }

      let vehicle = await Vehicle.findOne({ rfid });

      if (vehicle) {
        console.log("Vehicle already exists in DB");
        console.log("Authorized vehicle:", vehicle.vehicleNumber);

        // save every scan in vehicle history
        const savedVehicleHistory = await VehicleHistory.create({
          rfid: rfid,
          vehicleNumber: vehicle.vehicleNumber,
          owner: vehicle.owner || "Unknown",
          accessType: vehicle.accessType || "REGISTERED",
          gateStatus: latestGateStatus,
          slotNumber: 1,
          timestamp: new Date(),
        });

        console.log("Vehicle history saved successfully");
        console.log(savedVehicleHistory);

        client.publish("parking/gate/control", "OPEN_GATE");
        console.log("Sent -> OPEN_GATE");
      } else {
        console.log("New RFID detected. Registering now...");

        const newVehicle = new Vehicle({
          rfid: rfid,
          owner: "New User",
          vehicleNumber: "TEMP-" + rfid.slice(-4),
          accessType: "REGISTERED",
          createdAt: new Date(),
        });

        const savedVehicle = await newVehicle.save();
        console.log("Vehicle saved successfully");
        console.log(savedVehicle);

        const verifyVehicle = await Vehicle.findOne({ rfid });
        console.log("Verify saved vehicle:", verifyVehicle ? "FOUND" : "NOT FOUND");

        // save first scan in vehicle history also
        const savedVehicleHistory = await VehicleHistory.create({
          rfid: rfid,
          vehicleNumber: newVehicle.vehicleNumber,
          owner: newVehicle.owner,
          accessType: newVehicle.accessType,
          gateStatus: latestGateStatus,
          slotNumber: 1,
          timestamp: new Date(),
        });

        console.log("Vehicle history saved successfully");
        console.log(savedVehicleHistory);

        client.publish("parking/gate/control", "OPEN_GATE");
        console.log("Sent -> OPEN_GATE");
      }
    }

    // -------- SLOT --------
    else if (topic === "parking/slot") {
      const data = JSON.parse(msg);

      console.log("Parsed slot payload:", data);

      // 1. Update current/latest slot state
      let slot = await Slot.findOne({ slotNumber: data.slot });

      if (!slot) {
        slot = new Slot({
          slotNumber: data.slot,
          irStatus: "UNKNOWN",
          ultrasonicStatus: data.status,
          status: data.status,
          distance: Number(data.distance),
          timestamp: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Creating slot ${data.slot}`);
      } else {
        slot.ultrasonicStatus = data.status;
        slot.status = data.status;
        slot.distance = Number(data.distance);
        slot.timestamp = new Date();
        slot.updatedAt = new Date();
        console.log(`Updating slot ${data.slot}`);
      }

      const savedSlot = await slot.save();
      console.log("Slot saved successfully");
      console.log(savedSlot);

      // 2. Insert every reading into slot history
      const savedSlotHistory = await SlotHistory.create({
        slotNumber: data.slot,
        distance: Number(data.distance),
        status: data.status,
        timestamp: new Date(),
      });

      console.log("Slot history saved successfully");
      console.log(savedSlotHistory);
    }

    // -------- SMOKE --------
    else if (topic === "parking/smoke") {
      const data = JSON.parse(msg);

      if (data.status === "ALERT") {
        const savedAlert = await Alert.create({
          type: "SMOKE",
          message: "Smoke or harmful gas detected",
          value: Number(data.value),
          createdAt: new Date(),
        });

        console.log("Smoke alert stored");
        console.log(savedAlert);
      } else {
        console.log(`Smoke safe: ${data.value}`);
      }
    }

    // -------- GATE STATUS --------
    else if (topic === "parking/gate/status") {
      latestGateStatus = msg.trim().toLowerCase();
      console.log(`Gate status: ${latestGateStatus}`);
    }
  } catch (err) {
    console.log("Message handling error:", err.message);

    if (err.name === "ValidationError") {
      Object.keys(err.errors).forEach((key) => {
        console.log(`Validation issue in ${key}: ${err.errors[key].message}`);
      });
    }
  }
});

// -------- EXPRESS ROUTES --------
app.get("/api/health", (req, res) => {
  res.json({
    mongoReady: isMongoReady,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    mqttConnected: client.connected,
  });
});

app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/slots", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- DASHBOARD STATS --------
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });

    const totalSlots = slots.length;
    const occupied = slots.filter((slot) => slot.status === "OCCUPIED").length;
    const available = slots.filter((slot) => slot.status === "FREE").length;

    res.json({
      totalSlots,
      occupied,
      available,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- START SERVER --------
async function startServer() {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Vehicles: http://localhost:${PORT}/api/vehicles`);
    console.log(`Vehicle History: http://localhost:${PORT}/api/vehicle-history`);
    console.log(`Slots: http://localhost:${PORT}/api/slots`);
    console.log(`Slot History: http://localhost:${PORT}/api/slot-history`);
    console.log(`Alerts: http://localhost:${PORT}/api/alerts`);
    console.log(`Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
  });
}

startServer();