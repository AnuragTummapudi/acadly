import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./auth";
import routesRouter from "./routes";
import aiRouter from "./ai";
import createMemoryStore from "memorystore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MemoryStore = createMemoryStore(session);

// Body parsing - increase limit for calendar image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
    session({
        store: new MemoryStore({
            checkPeriod: 86400000, // 24h
        }),
        secret: process.env.SESSION_SECRET || "acadly-dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "lax",
        },
    })
);

// API Routes
app.use(authRouter);
app.use(routesRouter);
app.use(aiRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    const publicPath = path.join(__dirname, "../public");
    app.use(express.static(publicPath));
    app.get("*", (_req, res) => {
        res.sendFile(path.join(publicPath, "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`🎓 ACADLY server running on http://localhost:${PORT}`);
});

export default app;
