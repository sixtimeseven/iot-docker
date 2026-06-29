import { DeviceStateModel, IDeviceState } from "@iot/shared"; // "../../shared/src/models/device-state";

export async function setState(key: string, value: number): Promise<void> {
  await DeviceStateModel.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
}

export async function getState(key: string): Promise<number | undefined> {
  const doc = await DeviceStateModel.findOne({ key });
  return doc?.value;
}

export async function getAllStates(): Promise<{ key: string; value: number }[]> {
  const docs = await DeviceStateModel.find();
  return docs.map((d) => ({ key: d.key, value: d.value }));
}