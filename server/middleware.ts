import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { profiles } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = (req.session as any).userId;
    if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const [user] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, userId))
            .limit(1);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: "Authentication failed" });
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}
