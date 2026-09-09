import "dotenv/config";

import { createApp, parseAllowedOrigins } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    console.log("[hmi-api] database connection established");
  } catch (error) {
    // Never print the connection string: it contains credentials.
    console.error(
      "[hmi-api] database connection FAILED:",
      error instanceof Error ? error.message.replace(/mongodb(\+srv)?:\/\/\S+/gi, "<uri>") : error,
    );
    console.error("[hmi-api] startup aborted — check MONGODB_URI and Atlas network access.");
    process.exit(1);
  }

  createApp().listen(port, () => {
    console.log(`[hmi-api] listening on port ${port}`);
    console.log(`[hmi-api] allowed origins: ${parseAllowedOrigins().join(", ")}`);
  });
}

void bootstrap();
