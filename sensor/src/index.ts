import mqtt from "mqtt";
import {
  connectMongo,
  TelemetryModel,
  DeviceStateModel,
} from "@iot/shared";

const MONGO_URL  = process.env.MONGO_URL  ?? "mongodb://localhost:27017/iotdb";
const BROKER_URL = process.env.BROKER_URL ?? "mqtt://localhost:1883";
const DEVICE_ID  = process.env.DEVICE_ID  ?? "pi01";

async function boot() {
  await connectMongo(MONGO_URL);

  // clear old telemetry data from previous dev runs
  await TelemetryModel.deleteMany({});
  console.log("[sensor] previous dev telemetry cleared");

  const client = mqtt.connect(BROKER_URL, { clientId: `sensor-${DEVICE_ID}` });

  client.on("connect", () => console.log("[sensor] MQTT connected"));
  client.on("error",   (err) => console.error("[sensor] MQTT error:", err));

  let loopA = 0;

  setInterval(async () => {
    loopA = loopA === 0 ? 1 : 0;

    // 1. Persist telemetry
    await TelemetryModel.create({
      sensorName: "loopA",
      value: loopA,
      recordedAt: new Date(),
    });

    // 2. Upsert device state
    await DeviceStateModel.findOneAndUpdate(
      { key: "loopA" },
      { value: loopA },
      { upsert: true, new: true }
    );

    // 3. Publish via broker
    client.publish(
      `devices/${DEVICE_ID}/telemetry/loopA`,
      JSON.stringify({ value: loopA, ts: Date.now() })
    );

    console.log(`[sensor] loopA = ${loopA}`);
  }, 15000);
}

boot().catch((err) => {
  console.error("[sensor] boot failed:", err);
  process.exit(1);
});