import {Request, Response, NextFunction} from "express";
import { config } from "dotenv";


config();

const IsAuthenticated = (req : Request, res: Response, next : NextFunction) => {
    /**
     * Note: This middleware is a faux authentication middleware, it just checks if there is an authorization
     * header with a Bearer token supplied.
     * The value of the authorization header may look like this:
     * Bearer 2 // indicating the user making the request has an ID of 2
     */
    const token = extractTokenFromHeader(req);

    if (!token)
    return res
      .status(401)
      .send({ success: false, details: "No auth token provided" });

    // try the token sent by the user
    req.userId = token as unknown as number;

    next();
    
}

function extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

export default IsAuthenticated;