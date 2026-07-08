import { Aedes } from "aedes";
import { createServer } from "aedes-server-factory";

const TCP_PORT = 1883;
const WS_PORT  = 8888;

// const broker = await Aedes.createBroker();
const broker = await Aedes.createBroker({
  drainTimeout: 30000
});

// ── TCP listener ─────────────────────────────────────────────────
const tcpServer = createServer(broker);
tcpServer.listen(TCP_PORT, () =>
  console.log(`[broker] MQTT/TCP listening on :${TCP_PORT}`)
);

// ── WebSocket listener ───────────────────────────────────────────
const wsServer = createServer(broker, { ws: true });
wsServer.listen(WS_PORT, () =>
  console.log(`[broker] MQTT/WS  listening on :${WS_PORT}`)
);

// ── Lifecycle logging ────────────────────────────────────────────
broker.on("client", (client) =>
  console.log(`[broker] client connecting: ${client.id}`)
);
broker.on("clientReady", (client) =>
  console.log(`[broker] client ready: ${client.id}`)
);
broker.on("clientDisconnect", (client) =>
  console.log(`[broker] client disconnected: ${client.id}`)
);
broker.on("subscribe", (subscriptions, client) =>
  subscriptions.forEach((s) =>
    console.log(`[broker] ${client?.id} subscribed → ${s.topic} → QOS: ${s.qos}`)
  )
);
broker.on("publish", (packet, client) => {
  if (client) console.log(`[broker] ${client.id} pub → ${packet.topic}`);
});