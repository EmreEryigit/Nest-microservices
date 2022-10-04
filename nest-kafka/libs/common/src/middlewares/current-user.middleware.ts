import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";

export interface UserPayload {
    id: number;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private jwt: JwtService) {}
    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.session.jwt) {
            return next();
        }
        try {
            const payload = (await this.jwt.verify(
                req.session?.jwt
            )) as UserPayload;
            req.currentUser = payload;
        } catch (err) {
            console.error(err);
        }

        next();
    }
}
