import type { Request, Response } from "express";
import {
    checkPasswordHash,
    getBearerToken,
    makeJWT,
    makeRefreshToken,
} from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJson } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";
import {
    createRefreshToken,
    getUserFromRefreshToken,
    revokeRefreshToken,
} from "../db/queries/refreshTokens.js";

type LoginResponse = UserResponse & {
    token: string;
    refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
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

    const token = makeJWT(
        user.id,
        config.jwt.defaultDuration,
        config.jwt.secret
    );

    const refreshTokenString = makeRefreshToken();
    const refreshToken = await createRefreshToken(user.id, refreshTokenString);

    if (!refreshToken) {
        throw new Error("Couldn't save refresh token");
    }

    respondWithJson(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token,
        refreshToken: refreshTokenString,
    } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const result = await getUserFromRefreshToken(refreshToken);
    if (!result) {
        throw new UnauthorizedError("Couldn't get user for refresh token");
    }

    const accessToken = makeJWT(
        result.user.id,
        config.jwt.defaultDuration,
        config.jwt.secret
    );
    respondWithJson(res, 200, { token: accessToken });
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshTokenString = getBearerToken(req);
    const refreshToken = await revokeRefreshToken(refreshTokenString);
    if (!refreshToken) {
        throw new Error("Couldn't revoke session");
    }

    res.status(204).end();
}
