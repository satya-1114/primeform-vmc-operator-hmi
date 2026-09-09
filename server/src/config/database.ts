import mongoose from "mongoose";

export async function connectDatabase(uri?: string): Promise<void> {
  const connectionString = uri ?? process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and configure it.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 10_000 });
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
