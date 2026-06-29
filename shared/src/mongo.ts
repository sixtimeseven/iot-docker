import mongoose from "mongoose";

let connected = false;

export async function connectMongo(url: string): Promise<void> {
  if (connected) return;
  await mongoose.connect(url, { dbName: "iotdb" });
  connected = true;
  console.log("[mongo] connected: ", url);
}