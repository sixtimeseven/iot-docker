import { Aedes } from "aedes";
import { createServer } from "aedes-server-factory";
import { WebSocketServer } from "ws";
import { createServer as createHttpServer } from "node:http";

const TCP_PORT = 1883;
const WS_PORT  = 8888;

const broker = await Aedes.createBroker();

// ── TCP listener (device service, sensor service) ────────────────
const tcpServer = createServer(broker);
tcpServer.listen(TCP_PORT, () =>
  console.log(`[broker] MQTT/TCP listening on :${TCP_PORT}`)
);

// ── WebSocket listener (browser dashboard) ───────────────────────
const httpServer = createHttpServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  // aedes-server-factory helper wraps a WS stream into an MQTT stream
  const stream = createServer.createStream(ws);
  broker.handle(stream);
});

httpServer.listen(WS_PORT, () =>
  console.log(`[broker] MQTT/WS  listening on :${WS_PORT}`)
);

// ── Lifecycle logging ────────────────────────────────────────────
broker.on("client", (client) =>
  console.log(`[broker] client connected    : ${client.id}`)
);
broker.on("clientDisconnect", (client) =>
  console.log(`[broker] client disconnected : ${client.id}`)
);
broker.on("subscribe", (subscriptions, client) =>
  subscriptions.forEach((s) =>
    console.log(`[broker] ${client?.id} subscribed → ${s.topic}`)
  )
);
broker.on("publish", (packet, client) => {
  if (client) {
    console.log(`[broker] ${client.id} → ${packet.topic}`);
  }
});
