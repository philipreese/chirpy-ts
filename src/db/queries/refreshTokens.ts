import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
import { config } from "../../config.js";

export async function createRefreshToken(userId: string, refreshToken: string) {
    const [result] = await db
        .insert(refreshTokens)
        .values({
            token: refreshToken,
            userId: userId,
            expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
            revokedAt: null,
        })
        .returning();
    return result;
}

export async function getUserFromRefreshToken(refreshToken: string) {
    const [result] = await db
        .select({ user: users })
        .from(users)
        .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
        .where(
            and(
                eq(refreshTokens.token, refreshToken),
                gt(refreshTokens.expiresAt, new Date()),
                isNull(refreshTokens.revokedAt)
            )
        );
    return result;
}

export async function revokeRefreshToken(refreshToken: string) {
    const [result] = await db
        .update(refreshTokens)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(refreshTokens.token, refreshToken))
        .returning();
    return result;
}
