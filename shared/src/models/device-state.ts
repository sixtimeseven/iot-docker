import mongoose, { Document, Schema } from "mongoose";

export interface IDeviceState extends Document {
  key: string;
  value: number;
  updatedAt: Date;
}

const DeviceStateSchema = new Schema<IDeviceState>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
  }
);

export const DeviceStateModel = mongoose.model<IDeviceState>(
  "DeviceState",
  DeviceStateSchema
);