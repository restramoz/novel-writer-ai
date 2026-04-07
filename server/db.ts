import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  novels,
  masterConcepts,
  characters,
  chapters,
  readProgress,
  type Novel,
  type Character,
  type Chapter,
  type MasterConcept,
  type ReadProgress,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Novel queries
export async function getNovels(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(novels)
    .where(eq(novels.userId, userId))
    .orderBy(novels.updatedAt);
}

export async function getNovelById(id: string, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(novels)
    .where(and(eq(novels.id, id), eq(novels.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createNovel(
  userId: number,
  data: {
    title: string;
    genre: string;
    basicIdea?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(novels).values({
    userId,
    title: data.title,
    genre: data.genre,
    basicIdea: data.basicIdea || null,
  });

  return result;
}

export async function updateNovel(
  id: string,
  userId: number,
  data: Partial<Novel>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(novels)
    .set(data)
    .where(and(eq(novels.id, id), eq(novels.userId, userId)));
}

export async function deleteNovel(id: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(novels)
    .where(and(eq(novels.id, id), eq(novels.userId, userId)));
}

// Master Concept queries
export async function getMasterConcept(novelId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(masterConcepts)
    .where(eq(masterConcepts.novelId, novelId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateMasterConcept(
  novelId: string,
  data: Partial<MasterConcept>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getMasterConcept(novelId);

  if (existing) {
    return await db
      .update(masterConcepts)
      .set(data)
      .where(eq(masterConcepts.novelId, novelId));
  } else {
    return await db.insert(masterConcepts).values({
      novelId,
      ...data,
    });
  }
}

// Character queries
export async function getCharacters(novelId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(characters)
    .where(eq(characters.novelId, novelId));
}

export async function getCharacterById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createCharacter(
  novelId: string,
  data: {
    name: string;
    role: string;
    description?: string;
    skills?: string[];
    characteristics?: Record<string, unknown>;
    appearance?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(characters).values({
    novelId,
    name: data.name,
    role: data.role,
    description: data.description || null,
    skills: data.skills ? JSON.stringify(data.skills) : null,
    characteristics: data.characteristics
      ? JSON.stringify(data.characteristics)
      : null,
    appearance: data.appearance || null,
  });
}

export async function updateCharacter(id: string, data: Partial<Character>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(characters)
    .set(data)
    .where(eq(characters.id, id));
}

export async function deleteCharacter(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(characters).where(eq(characters.id, id));
}

// Chapter queries
export async function getChapters(novelId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chapters)
    .where(eq(chapters.novelId, novelId))
    .orderBy(chapters.chapterNumber);
}

export async function getChapterById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createChapter(
  novelId: string,
  data: {
    chapterNumber: number;
    title: string;
    content?: string;
    summary?: string;
    wordCount?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(chapters).values({
    novelId,
    chapterNumber: data.chapterNumber,
    title: data.title,
    content: data.content || null,
    summary: data.summary || null,
    wordCount: data.wordCount || 0,
  });
}

export async function updateChapter(id: string, data: Partial<Chapter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(chapters)
    .set(data)
    .where(eq(chapters.id, id));
}

export async function deleteChapter(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(chapters).where(eq(chapters.id, id));
}

// Reading Progress queries
export async function getReadProgress(userId: number, novelId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(readProgress)
    .where(and(eq(readProgress.userId, userId), eq(readProgress.novelId, novelId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateReadProgress(
  userId: number,
  novelId: string,
  data: { lastChapter: number; scrollPercentage: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getReadProgress(userId, novelId);

  if (existing) {
    return await db
      .update(readProgress)
      .set(data)
      .where(
        and(eq(readProgress.userId, userId), eq(readProgress.novelId, novelId))
      );
  } else {
    return await db.insert(readProgress).values({
      userId,
      novelId,
      ...data,
    });
  }
}
