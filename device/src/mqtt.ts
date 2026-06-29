import mqtt from "mqtt";
import { RelayCmdSchema, RelayAckSchema, RelayStateSchema } from "@iot/shared";
import { enqueueCommand } from "./queue.js";

const BROKER_URL = process.env.BROKER_URL ?? "mqtt://localhost:1883";
const DEVICE_ID  = process.env.DEVICE_ID  ?? "pi01";

const cmdTopic =  `devices/${DEVICE_ID}/commands/relay`;

export function createMqttClient() {
  const client = mqtt.connect(BROKER_URL, { clientId: `device-${DEVICE_ID}` });

  client.on("connect", () => {
    client.subscribe(cmdTopic);
    console.log(`[mqtt] connected → subscribed to ${cmdTopic}`);
  });

  client.on("message", async (topic, msg) => {
    if (topic !== cmdTopic) return;

    const payload = JSON.parse(msg.toString());
    const command = RelayCmdSchema.parse(payload);

    // persist to mongo + signal the relay worker
    await enqueueCommand(
      command.requestId,
      command.deviceId,
      command.relay,
      command.state
    );

    // ack back to dashboard
    client.publish(
      `devices/${DEVICE_ID}/state`,
      JSON.stringify(
        RelayStateSchema.parse({
          relay: command.relay,
          state: command.state,
          ts: Date.now(),
        })
      )
    );
  });

  client.on("error", (err) => console.error("[mqtt] error:", err));

  return client;
}