import { z } from "zod";

// ── Relay command (API → broker → device) ────────────────────────
export const RelayCmdSchema = z.object({
  requestId: z.uuid(),
  deviceId:  z.string(),
  relay:     z.number().int().positive(),
  state:     z.boolean(),
});

// ── Broker ACK (device → broker → dashboard) ────────────────────
export const RelayAckSchema = z.object({
  requestId: z.uuid(),
  status:    z.enum(["ok", "error"]),
  reason:    z.string().optional(),
});

// ── State update (device → broker → dashboard) ──────────────────
export const RelayStateSchema = z.object({
  relay: z.number().int().positive(),
  state: z.boolean(),
  ts:    z.number(),
});

// ── Telemetry (sensor → broker) ─────────────────────────────────
export const TelemetryPayloadSchema = z.object({
  value: z.number(),
  ts:    z.number(),
});

export type RelayCmd         = z.infer<typeof RelayCmdSchema>;
export type RelayAck         = z.infer<typeof RelayAckSchema>;
export type RelayState       = z.infer<typeof RelayStateSchema>;
export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;