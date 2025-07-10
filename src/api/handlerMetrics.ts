import type { Request, Response } from "express";
import { apiConfig } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${apiConfig.fileserverHits}`);
    res.end();
}