import type { Request, Response, NextFunction } from "express";
import { apiConfig } from "../config.js";
import { respondWithError } from "./json.js";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "./errors.js";

export function middlewareLogResponses(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode >= 300) {
            console.log(
                `[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`
            );
        }
    });

    next();
}

export function middlewareBlockChromeDevTools(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.path === "/.well-known/appspecific/com.chrome.devtools.json") {
        return res.status(204).end();
    }
    next();
}

export function middlewareMetricsInc(
    _: Request,
    __: Response,
    next: NextFunction
) {
    apiConfig.fileserverHits++;
    next();
}

export function middlewareErrorHandler(
    err: Error,
    _: Request,
    res: Response,
    __: NextFunction
) {
    if (err instanceof BadRequestError) {
        respondWithError(res, 400, err.message);
    } else if (err instanceof UnauthorizedError) {
        respondWithError(res, 401, err.message);
    } else if (err instanceof ForbiddenError) {
        respondWithError(res, 403, err.message);
    } else if (err instanceof NotFoundError) {
        respondWithError(res, 404, err.message);
    } else {
        console.log(err.message);
        respondWithError(res, 500, "Something went wrong on our end");
    }
}
