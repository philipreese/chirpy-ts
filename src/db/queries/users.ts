import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteUsers() {
    await db.delete(users);
}

export async function getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length === 0) {
        return;
    }
    return result[0];
}

export async function updateUser(
    userId: string,
    email: string,
    hashedPassword: string
) {
    const [result] = await db
        .update(users)
        .set({
            email: email,
            hashedPassword: hashedPassword,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

    return result;
}

export async function upgradeUser(userId: string) {
    const [result] = await db
        .update(users)
        .set({ isChirpyRed: true })
        .where(eq(users.id, userId))
        .returning();

    return result;
}
