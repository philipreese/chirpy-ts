import type { Request, Response } from "express";
import { apiConfig } from "../config.js";

export async function handlerReset(_: Request, res: Response) {
    apiConfig.fileserverHits = 0;
    res.end();
}