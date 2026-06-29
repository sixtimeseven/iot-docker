/**
 * queue.ts (MongoDB edition)
 *
 * The EventEmitter bus is gone. The MQTT broker is now the signal:
 *   - enqueueCommand() persists to Mongo and publishes a "job-ready"
 *     notification on devices/{id}/internal/job-ready
 *   - relay-worker.ts subscribes to that topic instead of queueEvents
 */
import type { MqttClient } from "mqtt";
import {
  CommandModel,
  type ICommand,
} from "@iot/shared";

let _mqttClient: MqttClient | null = null;

/** Call once from index.ts after the MQTT client is ready */
export function initQueue(client: MqttClient) {
  _mqttClient = client;
}

export async function enqueueCommand(
  requestId: string,
  deviceId: string,
  relay: number,
  desiredState: boolean
): Promise<void> {
  await CommandModel.create({ requestId, deviceId, relay, desiredState });

  // Signal the worker via MQTT (replaces queueEvents.emit)
  _mqttClient?.publish(
    `devices/${deviceId}/internal/job-ready`,
    JSON.stringify({ requestId })
  );
}

export async function getNextPendingCommand(): Promise<ICommand | null> {
  return CommandModel.findOne({ status: "pending" }).sort({ createdAt: 1 });
}

export async function resetProcessingCommands(): Promise<void> {
  await CommandModel.updateMany(
    { status: "processing" },
    { $set: { status: "pending" } }
  );
}

export async function markProcessing(id: string): Promise<void> {
  await CommandModel.findByIdAndUpdate(id, { status: "processing" });
}

export async function markCompleted(id: string): Promise<void> {
  await CommandModel.findByIdAndUpdate(id, {
    status: "completed",
    processedAt: new Date(),
  });
}

export async function markFailed(id: string, error?: string): Promise<void> {
  await CommandModel.findByIdAndUpdate(id, { status: "failed" });
  if (error) console.error("[queue] failed:", error);
}
