import type { Request, Response } from "express";
import { respondWithError, respondWithJson } from "./json.js";

export async function handlerValidateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;

    if (typeof params.body !== "string" || params.body.length === 0) {
        respondWithError(res, 400, "Something went wrong");
        return;
    }

    const profanity: string[] = ["kerfuffle", "sharbert", "fornax"];
    const splitChirp = params.body.split(" ");
    for (let i = 0; i < splitChirp.length; i++) {
        if (profanity.includes(splitChirp[i].toLowerCase())) {
            splitChirp[i] = "****";
        }
    }

    const cleanedBody = splitChirp.join(" ");

    if (cleanedBody.length > 140) {
        respondWithError(res, 400, "Chirp is too long");
        return;
    }

    respondWithJson(res, 200, { cleanedBody: cleanedBody });
}
