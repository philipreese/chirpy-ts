import { Request, Response } from "express";
import { upgradeUser } from "../db/queries/users.js";
import { NotFoundError } from "./errors.js";

export async function handlerWebhook(req: Request, res: Response) {
    type parameters = {
        event: string;
        data: {
            userId: string;
        };
    };

    const params: parameters = req.body;
    if (params.event !== "user.upgraded") {
        res.status(204).end();
        return;
    }

    const user = await upgradeUser(params.data.userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    res.status(204).end();
}
