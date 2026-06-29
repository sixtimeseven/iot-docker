import { getAllStates } from "./state.js";

export async function restoreState(): Promise<void> {
  const states = await getAllStates();
  console.log("[startup] restoring state:", states);

  for (const item of states) {
    if (item.key.startsWith("relay_")) {
      const relayNumber = Number(item.key.replace("relay_", ""));
      const desiredState = Boolean(item.value);
      console.log(`[startup] relay ${relayNumber} → ${desiredState}`);
      // TODO: gpio.write(relayNumber, desiredState)
    }
  }
}