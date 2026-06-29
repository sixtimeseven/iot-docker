import mongoose, { Document, Schema } from "mongoose";

export interface ITelemetry extends Document {
  sensorName: string;
  value: number;
  recordedAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>({
  sensorName: { type: String, required: true },
  value: { type: Number, required: true },
  recordedAt: { type: Date, default: () => new Date() },
});

// TTL index: auto-delete records older than 30 days
TelemetrySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
TelemetrySchema.index({ sensorName: 1, recordedAt: -1 });

export const TelemetryModel = mongoose.model<ITelemetry>("Telemetry", TelemetrySchema);
