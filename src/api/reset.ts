import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/users.js";
import { ForbiddenError } from "./errors.js";

export async function handlerReset(_: Request, res: Response) {
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("Reset is only allowed in dev environments");
    }

    config.api.fileserverHits = 0;
    await deleteUsers();

    res.write("Hits reset to 0");
    res.end();
}
