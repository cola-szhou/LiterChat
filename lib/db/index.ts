import "dotenv/config";
// import { drizzle } from "drizzle-orm/sqlite";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { user } from "./schema";
import { message } from "./schema";

// const db = drizzle(process.env.DB_FILE_NAME!);
const sqlite = new Database("./lib/db/test.db");
const db = drizzle(sqlite);

export { db };
