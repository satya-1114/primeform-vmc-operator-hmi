import { MongoMemoryServer } from "mongodb-memory-server";
const m = await MongoMemoryServer.create({ instance: { port: 47017 } });
console.log(m.getUri("primeform_hmi"));
await new Promise(() => {});
