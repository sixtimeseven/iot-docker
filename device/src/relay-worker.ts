/**
 * relay-worker.ts (MQTT edition)
 *
 * Instead of listening on queueEvents (EventEmitter), the worker now
 * subscribes to devices/{deviceId}/internal/job-ready on the broker.
 */
import type { MqttClient } from "mqtt";
import {
  getNextPendingCommand,
  markCompleted,
  markFailed,
  markProcessing,
  resetProcessingCommands,
} from "./queue.js";
import { setState } from "./state.js";

let processing = false;

export async function startRelayWorker(client: MqttClient, deviceId: string): Promise<void> {
  console.log("[relay-worker] starting…");

  await resetProcessingCommands();

  // Subscribe to the internal job-ready signal
  client.subscribe(`devices/${deviceId}/internal/job-ready`);
  client.on("message", (topic) => {
    if (topic === `devices/${deviceId}/internal/job-ready`) {
      processNextCommand();
    }
  });

  // Drain any commands that were pending before this boot
  processNextCommand();
}

function processNextCommand(): void {
  if (processing) return;

  processing = true;

  getNextPendingCommand()
    .then(async (command) => {
      if (!command) return;

      await markProcessing(String(command._id));
      console.log(
        command.desiredState ? "[relay] * * ON * *" : "[relay] * * OFF * *"
      );

      // TODO: replace with real GPIO write when running on Pi
      await setState(`relay_${command.relay}`, command.desiredState ? 1 : 0);
      await markCompleted(String(command._id));
    })
    .catch(async (err) => {
      console.error("[relay-worker] error:", err);
    })
    .finally(() => {
      processing = false;
      // Keep draining if more commands are waiting
      getNextPendingCommand().then((next) => {
        if (next) processNextCommand();
      });
    });
}
