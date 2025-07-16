import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "./errors.js";
import {
    createChirp,
    deleteChirp,
    getChirpById,
    getChirps,
    getChirpsByUserId,
} from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwt.secret);

    const chirp = await createChirp({
        body: validateChirp(params.body),
        userId: userId,
    });

    if (!chirp) {
        throw new Error("Couldn't create chirp");
    }

    respondWithJson(res, 201, chirp);
}

export async function handlerGetChirps(req: Request, res: Response) {
    let authorId = "";
    const authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }

    let sort = "asc";
    const sortQuery = req.query.sort;
    if (typeof sortQuery === "string") {
        sort = sortQuery;
    }

    const chirps =
        authorId == "" ? await getChirps() : await getChirpsByUserId(authorId);

    if (sort === "desc") {
        chirps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

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

export async function handlerDeleteChirp(req: Request, res: Response) {
    const chirpId = req.params.chirpID;
    if (!chirpId) {
        throw new BadRequestError("Chirp ID not provided");
    }

    const bearerToken = getBearerToken(req);
    const userId = validateJWT(bearerToken, config.jwt.secret);
    if (!userId) {
        throw new UnauthorizedError("Couldn't validate JWT");
    }

    const chirp = await getChirpById(chirpId);
    if (!chirp) {
        throw new NotFoundError("Couldn't get chirp");
    }

    if (userId !== chirp.userId) {
        throw new ForbiddenError("Not authorized to delete chirp");
    }

    const success = await deleteChirp(chirpId);
    if (!success) {
        throw new Error("Couldn't delete chirp");
    }

    res.status(204).end();
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
