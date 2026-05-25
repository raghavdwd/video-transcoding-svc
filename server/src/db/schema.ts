import { sql } from "drizzle-orm";
import { pgTable, varchar, serial, timestamp, json } from "drizzle-orm/pg-core";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  path: varchar("path", { length: 255 }).notNull(),
  transcodedFiles: json("transcoded_files").default({}),
  thumbnail: varchar("thumbnail", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
