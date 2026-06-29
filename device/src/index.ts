import { connectMongo } from "@iot/shared";
import { createMqttClient } from "./mqtt.js"
import { initQueue } from "./queue.js";
import { restoreState } from "./startup.js";
import { startRelayWorker } from "./relay-worker.js";

const MONGO_URL = process.env.MONGO_URL ?? "mongodb://localhost:27017/iotdb";
const DEVICE_ID = process.env.DEVICE_ID ?? "pi01";

async function boot() {
  await connectMongo(MONGO_URL);

  const mqttClient = createMqttClient();

  // wire the queue module to o the mqtt client so it can signal the worker
  initQueue(mqttClient);

  await restoreState();
  await startRelayWorker(mqttClient, DEVICE_ID);

  console.log("[device] ready");
}

boot().catch((err) => {
  console.error("[device] boot failed:", err);
  process.exit(1);
})
