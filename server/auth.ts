import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { profiles, registerSchema, loginSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Register
router.post("/api/auth/register", async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { fullName, email, password, role } = parsed.data;

        // Check if email already exists
        const existing = await db
            .select()
            .from(profiles)
            .where(eq(profiles.email, email))
            .limit(1);

        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [user] = await db
            .insert(profiles)
            .values({ fullName, email, passwordHash, role })
            .returning();

        (req.session as any).userId = user.id;

        const { passwordHash: _, ...safeUser } = user;
        return res.status(201).json(safeUser);
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Registration failed" });
    }
});

// Login
router.post("/api/auth/login", async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { email, password } = parsed.data;

        const [user] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.email, email))
            .limit(1);

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        (req.session as any).userId = user.id;

        const { passwordHash: _, ...safeUser } = user;
        return res.json(safeUser);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Login failed" });
    }
});

// Logout
router.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out" });
    });
});

// Get current user
router.get("/api/auth/me", async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const [user] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, userId))
            .limit(1);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const { passwordHash: _, ...safeUser } = user;
        return res.json(safeUser);
    } catch (error) {
        console.error("Auth check error:", error);
        return res.status(500).json({ error: "Authentication check failed" });
    }
});

export default router;
