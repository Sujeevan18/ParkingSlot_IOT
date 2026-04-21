const mqtt = require("mqtt");
const express = require("express");
const mongoose = require("mongoose");

const Vehicle = require("./models/vehicle");
const Slot = require("./models/slot");
const Alert = require("./models/Alert");

const app = express();
app.use(express.json());

// -------- MONGODB --------
const MONGO_URI =
  "mongodb://yogarajansujeevan2002_db_user:IOTBDA81@ac-die1gpm-shard-00-00.1kws2ir.mongodb.net:27017,ac-die1gpm-shard-00-01.1kws2ir.mongodb.net:27017,ac-die1gpm-shard-00-02.1kws2ir.mongodb.net:27017/parkingDB?ssl=true&replicaSet=atlas-4j3m4l-shard-0&authSource=admin&appName=ParkingSystem";

let isMongoReady = false;

// -------- CONNECT MONGODB --------
async function connectMongo() {
  try {
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
    "parking/gate/status"
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

        client.publish("parking/gate/control", "OPEN_GATE");
        console.log("Sent -> OPEN_GATE");
      } else {
        console.log("New RFID detected. Registering now...");

        const newVehicle = new Vehicle({
          rfid: rfid,
          owner: "New User",
          vehicleNumber: "TEMP-" + rfid.slice(-4),
          accessType: "REGISTERED",
          createdAt: new Date()
        });

        const savedVehicle = await newVehicle.save();
        console.log("Vehicle saved successfully");
        console.log(savedVehicle);

        const verifyVehicle = await Vehicle.findOne({ rfid });
        console.log("Verify saved vehicle:", verifyVehicle ? "FOUND" : "NOT FOUND");

        client.publish("parking/gate/control", "OPEN_GATE");
        console.log("Sent -> OPEN_GATE");
      }
    }

    // -------- SLOT --------
    else if (topic === "parking/slot") {
      const data = JSON.parse(msg);

      let slot = await Slot.findOne({ slotNumber: data.slot });

      if (!slot) {
        slot = new Slot({
          slotNumber: data.slot,
          irStatus: "UNKNOWN",
          ultrasonicStatus: data.status,
          status: data.status,
          distance: Number(data.distance),
          updatedAt: new Date()
        });
        console.log(`Creating slot ${data.slot}`);
      } else {
        slot.ultrasonicStatus = data.status;
        slot.status = data.status;
        slot.distance = Number(data.distance);
        slot.updatedAt = new Date();
        console.log(`Updating slot ${data.slot}`);
      }

      const savedSlot = await slot.save();
      console.log("Slot saved successfully");
      console.log(savedSlot);
    }

    // -------- SMOKE --------
    else if (topic === "parking/smoke") {
      const data = JSON.parse(msg);

      if (data.status === "ALERT") {
        const savedAlert = await Alert.create({
          type: "SMOKE",
          message: "Smoke or harmful gas detected",
          value: Number(data.value),
          createdAt: new Date()
        });

        console.log("Smoke alert stored");
        console.log(savedAlert);
      } else {
        console.log(`Smoke safe: ${data.value}`);
      }
    }

    // -------- GATE STATUS --------
    else if (topic === "parking/gate/status") {
      console.log(`Gate status: ${msg}`);
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
app.get("/", (req, res) => {
  res.send("Smart Parking Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    mongoReady: isMongoReady,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    mqttConnected: client.connected
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

// -------- START SERVER --------
async function startServer() {
  await connectMongo();

  app.listen(3000, () => {
    console.log("Server running on port 3000");
    console.log("Health: http://localhost:3000/api/health");
    console.log("Vehicles: http://localhost:3000/api/vehicles");
    console.log("Slots: http://localhost:3000/api/slots");
    console.log("Alerts: http://localhost:3000/api/alerts");
  });
}

startServer();