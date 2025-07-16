import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "src/db/schema.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

type parameters = {
    email: string;
    password: string;
};

export async function handlerCreateUser(req: Request, res: Response) {
    const params: parameters = req.body;

    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPwd = await hashPassword(params.password);

    const user = await createUser({
        email: params.email,
        hashedPassword: hashedPwd,
    } satisfies NewUser);

    if (!user) {
        throw new Error("Could not create user");
    }

    respondWithJson(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
    const bearerToken = getBearerToken(req);
    const userId = validateJWT(bearerToken, config.jwt.secret);

    const params: parameters = req.body;

    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);
    const user = await updateUser(userId, params.email, hashedPassword);

    if (!user) {
        throw new Error("Could not update user");
    }

    respondWithJson(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}
