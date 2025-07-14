import { describe, it, expect, beforeAll } from "vitest";
import {
    checkPasswordHash,
    getBearerToken,
    hashPassword,
    makeJWT,
    validateJWT,
} from "./auth";
import { UnauthorizedError } from "./api/errors";
import { Request } from "express";

describe("Password Hashing", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
        const result = await checkPasswordHash(password2, hash1);
        expect(result).toBe(false);
    });
});

describe("Json Web Tokens", () => {
    const secret = "1234";
    const badSecret = "9876";
    const badToken = "token.user.1234";
    const userId = "userId!";
    let token: string;
    type MockRequest = {
        get: (key: string) => string | undefined;
    };

    beforeAll(async () => {
        token = makeJWT(userId, 3600, secret);
    });

    it("should validate a valid token", () => {
        const result = validateJWT(token, secret);
        expect(result).toBe(userId);
    });

    it("should throw error for invalid token", () => {
        expect(() => validateJWT(badToken, secret)).toThrow(UnauthorizedError);
    });

    it("should throw error when token is signed with wrong secret", () => {
        expect(() => validateJWT(token, badSecret)).toThrow(UnauthorizedError);
    });
});

describe("Get Bearer Token", () => {
    type MockRequest = {
        get: (key: string) => string | undefined;
    };

    it("get bearer token", () => {
        const req: MockRequest = {
            get: (key: string) => {
                if (key === "Authorization") {
                    return "Bearer 123456";
                }
                return undefined;
            },
        };
        const result = getBearerToken(req as Request);
        expect(result).toBe("123456");
    });
});
