import type { Request, Response, NextFunction } from "express";
import { apiConfig } from "../config.js";

function middlewareLogResponses(
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

function middlewareBlockChromeDevTools(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.path === "/.well-known/appspecific/com.chrome.devtools.json") {
        return res.status(204).end();
    }
    next();
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    apiConfig.fileserverHits++;
    next();
}

export {
    middlewareLogResponses,
    middlewareBlockChromeDevTools,
    middlewareMetricsInc,
};
