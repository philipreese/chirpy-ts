import type { Request, Response } from "express";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJson } from "./json.js";
import { UserResponse } from "./users.js";

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

    respondWithJson(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}
