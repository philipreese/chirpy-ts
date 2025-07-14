import type { Request, Response } from "express";
import { checkPasswordHash, getBearerToken, makeJWT } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJson } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";

type LoginResponse = UserResponse & {
    token: string;
};

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
        expiresInSeconds?: number;
    };

    const params: parameters = req.body;

    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatch = await checkPasswordHash(
        params.password,
        user.hashedPassword
    );
    if (!passwordMatch) {
        throw new UnauthorizedError("Invalid email or password");
    }

    let expTime = config.jwt.defaultDuration;
    if (
        params.expiresInSeconds &&
        params.expiresInSeconds > 0 &&
        params.expiresInSeconds < config.jwt.defaultDuration
    ) {
        expTime = params.expiresInSeconds;
    }

    const token = makeJWT(user.id, expTime, config.jwt.secret);

    respondWithJson(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token,
    } satisfies LoginResponse);
}
