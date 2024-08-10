import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
export * from "drizzle-orm";
const client = createClient({
  url: "DATABASE_URL",
  authToken: "DATABASE_AUTH_TOKEN",
});
export const db = drizzle(client);
