import type { Request, Response } from "express";
import { respondWithError, respondWithJson } from "./json.js";

export async function handlerValidateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    };

    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });

    let params: parameters;
    req.on("end", () => {
        try {
            params = JSON.parse(body);
        } catch (error) {
            respondWithError(res, 400, "Invalid JSON");
            return;
        }

        if (typeof params.body !== "string" || params.body.length === 0) {
            respondWithError(res, 400, "Something went wrong");
            return;
        }

        if (params.body.length > 140) {
            respondWithError(res, 400, "Chirp is too long");
            return;
        }

        respondWithJson(res, 200, { valid: true });
    });
}
