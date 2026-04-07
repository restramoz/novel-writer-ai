import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  longtext,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Novel Writing Tables
export const novels = mysqlTable("novels", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  genre: varchar("genre", { length: 100 }).default("Fantasy"),
  status: mysqlEnum("status", ["planning", "writing", "completed"]).default(
    "planning"
  ),
  basicIdea: longtext("basicIdea"),
  wordCount: int("wordCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Novel = typeof novels.$inferSelect;
export type InsertNovel = typeof novels.$inferInsert;

export const masterConcepts = mysqlTable("masterConcepts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  novelId: varchar("novelId", { length: 36 })
    .notNull()
    .references(() => novels.id, { onDelete: "cascade" }),
  expandedSynopsis: longtext("expandedSynopsis"),
  plotOutline: longtext("plotOutline"),
  prologue: longtext("prologue"),
  storyArcs: json("storyArcs"),
  themes: text("themes"),
  tone: text("tone"),
  worldbuildingNotes: longtext("worldbuildingNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MasterConcept = typeof masterConcepts.$inferSelect;
export type InsertMasterConcept = typeof masterConcepts.$inferInsert;

export const characters = mysqlTable("characters", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  novelId: varchar("novelId", { length: 36 })
    .notNull()
    .references(() => novels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: varchar("role", { length: 100 }).default("Supporting"),
  description: longtext("description"),
  skills: json("skills"),
  characteristics: json("characteristics"),
  appearance: longtext("appearance"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

export const chapters = mysqlTable("chapters", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  novelId: varchar("novelId", { length: 36 })
    .notNull()
    .references(() => novels.id, { onDelete: "cascade" }),
  chapterNumber: int("chapterNumber").notNull(),
  title: text("title").default("Untitled"),
  content: longtext("content"),
  summary: longtext("summary"),
  status: mysqlEnum("status", ["draft", "review", "published"]).default(
    "draft"
  ),
  wordCount: int("wordCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

export const readProgress = mysqlTable("readProgress", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  novelId: varchar("novelId", { length: 36 })
    .notNull()
    .references(() => novels.id, { onDelete: "cascade" }),
  lastChapter: int("lastChapter").default(1),
  scrollPercentage: float("scrollPercentage").default(0),
  lastReadAt: timestamp("lastReadAt")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

export type ReadProgress = typeof readProgress.$inferSelect;
export type InsertReadProgress = typeof readProgress.$inferInsert;
