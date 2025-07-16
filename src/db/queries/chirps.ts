import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getChirps() {
    return await db.select().from(chirps);
}

export async function getChirpsByUserId(userId: string) {
    return await db.select().from(chirps).where(eq(chirps.userId, userId));
}

export async function getChirpById(id: string) {
    const result = await db.select().from(chirps).where(eq(chirps.id, id));
    if (result.length === 0) {
        return;
    }

    return result[0];
}

export async function deleteChirp(id: string) {
    const result = await db.delete(chirps).where(eq(chirps.id, id)).returning();
    return result.length > 0;
}
