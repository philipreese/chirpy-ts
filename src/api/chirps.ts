import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";

export async function handlerCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    };

    const params: parameters = req.body;

    const chirp = await createChirp({
        body: validateChirp(params.body),
        userId: params.userId,
    });

    if (!chirp) {
        throw new Error("Couldn't create chirp");
    }

    respondWithJson(res, 201, chirp);
}

function validateChirp(body: string) {
    const profanity: string[] = ["kerfuffle", "sharbert", "fornax"];
    const splitChirp = body.split(" ");
    for (let i = 0; i < splitChirp.length; i++) {
        if (profanity.includes(splitChirp[i].toLowerCase())) {
            splitChirp[i] = "****";
        }
    }

    const cleanedBody = splitChirp.join(" ");

    if (cleanedBody.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    return cleanedBody;
}
