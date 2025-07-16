import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./api/errors.js";
import { Request } from "express";
import crypto from "crypto";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function checkPasswordHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
    userID: string,
    expiresIn: number,
    secret: string
): string {
    const issuedAt = Math.floor(Date.now() / 1000);

    return jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: issuedAt + expiresIn,
        } satisfies payload,
        secret
    );
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;

    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (error) {
        throw new UnauthorizedError("Invalid token");
    }

    if (decoded.iss != TOKEN_ISSUER) {
        throw new UnauthorizedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    let bearerToken = req.get("Authorization");
    if (!bearerToken) {
        throw new BadRequestError("missing Authorization header");
    }

    if (!bearerToken.toLowerCase().startsWith("bearer ")) {
        throw new BadRequestError(
            `authorization header must start with "Bearer "`
        );
    }

    const token = bearerToken.substring(7).trim();
    if (token === "") {
        throw new UnauthorizedError("missing token in Authorization header");
    }
    return token;
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
