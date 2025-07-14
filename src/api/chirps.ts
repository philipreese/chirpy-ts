import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";

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

export async function handlerGetChirps(req: Request, res: Response) {
    const chirps = await getChirps();
    respondWithJson(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
    const chirpId = req.params.chirpID;
    if (!chirpId) {
        throw new BadRequestError("Chirp ID not provided");
    }

    const chirp = await getChirpById(chirpId);
    if (!chirp) {
        throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
    }

    respondWithJson(res, 200, chirp);
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
