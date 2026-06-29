import mongoose, { Document, Schema } from "mongoose";

export type CommandStatus = "pending" | "processing" | "completed" | "failed";

export interface ICommand extends Document {
  requestId: string;
  deviceId: string;
  relay: number;
  desiredState: boolean;
  status: CommandStatus;
  createdAt: Date;
  processedAt?: Date;
}

const CommandSchema = new Schema<ICommand>(
  {
    requestId:    { type: String, required: true, unique: true },
    deviceId:     { type: String, required: true },
    relay:        { type: Number, required: true },
    desiredState: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// Index for the worker's queue drain query
CommandSchema.index({ status: 1, createdAt: 1 });

export const CommandModel = mongoose.model<ICommand>("Command", CommandSchema);
