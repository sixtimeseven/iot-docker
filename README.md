# IoT Docker — MQTT + MongoDB Edition

Restructured from a single-process SQLite/EventEmitter app into five
Docker Compose services.

## Services

| Service         | Port(s)       | Description                                    |
|-----------------|---------------|------------------------------------------------|
| `mongo`         | 27017         | Persistent store (replaces SQLite)             |
| `mongo-express` | 8081          | Admin UI — browse collections in the browser   |
| `broker`        | 1883, 8888    | Aedes MQTT. TCP for services, WS for dashboard |
| `device`        | —             | Relay worker + MQTT command handler            |
| `sensor`        | —             | Simulated loopA sensor, publishes telemetry    |

## Directory layout

```
iot-docker/
├── docker-compose.yml
├── index.html                  # Dashboard (open directly in browser)
├── shared/                     # Mongoose models + Zod schemas (shared lib)
│   └── src/
│       ├── index.ts
│       ├── mongo.ts
│       ├── schemas.ts
│       └── models/
│           ├── command.ts      # replaces SQLite command_queue
│           ├── device-state.ts # replaces SQLite device_state
│           └── telemetry.ts    # replaces SQLite telemetry
├── broker/                     # Aedes broker (plain JS — no compile step)
│   └── src/index.js
├── device/                     # Relay command consumer + worker
│   └── src/
│       ├── index.ts            # Boot: Mongo → MQTT → restoreState → worker
│       ├── mqtt.ts             # Subscribes to commands/relay
│       ├── queue.ts            # MongoDB-backed command queue
│       ├── relay-worker.ts     # Drains queue, sets GPIO state
│       ├── startup.ts          # Restores relay state on boot
│       └── state.ts            # DeviceState upsert helpers
└── sensor/                     # Simulated sensor (loopA)
    └── src/index.ts
```

## What changed from the original

| Before                          | After                                        |
|---------------------------------|----------------------------------------------|
| `better-sqlite3` / `db.ts`      | `mongoose` + `shared/src/models/`            |
| `EventEmitter` (queueEvents)    | MQTT topic `devices/{id}/internal/job-ready` |
| Single process (`index.ts`)     | Three containers: broker, device, sensor     |
| `BrokerUrl` from helpers file   | `BROKER_URL` environment variable            |
| SQLite file on disk             | MongoDB volume (`mongo-data`)                |

## Quickstart

```bash
docker compose up --build
```

Then open `index.html` in your browser (no server needed — it connects
directly to the broker's WebSocket on `ws://127.0.0.1:8888`).

- Mongo Express admin: http://localhost:8081
- Click **Turn Relay ON / OFF** to enqueue a command and watch the log.

## Environment variables

Each app service reads these (defaults shown):

```
MONGO_URL=mongodb://mongo:27017/iotdb
BROKER_URL=mqtt://broker:1883
DEVICE_ID=pi01
```

Override them in `docker-compose.yml` or a `.env` file.
