import { Request, Response, NextFunction } from "express";
import customCache from "../utils/cutom-cache";

/**
 * Middleware function for handling idempotency key checks and caching.
 * If an idempotency key exists in the request headers and a cached response is found,
 * it sends the cached response as the HTTP response and exits the middleware chain.
 * If no cached response is found, it proceeds to the next middleware in the chain.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next Express NextFunction to call the next middleware in the chain.
 */
const idempotencyMiddleWare = (req: Request, res: Response, next: NextFunction): void => {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const userId = req.userId;

    if (idempotencyKey) {
        const cachedResponse = customCache.get(`Bearer ${userId}-${idempotencyKey}`);
        if (cachedResponse) {
            res.json(cachedResponse);
            return;
        }
    }

    next();
}


export default idempotencyMiddleWare;
