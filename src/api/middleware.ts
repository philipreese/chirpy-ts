import type { Request, Response, NextFunction } from "express";
import { apiConfig } from "../config.js";
import { respondWithError } from "./json.js";

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
    console.log(err.message);
    respondWithError(res, 500, "Something went wrong on our end");
}
