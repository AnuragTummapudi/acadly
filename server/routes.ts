import { Router } from "express";
import { db } from "./db";
import { requireAuth, requireRole } from "./middleware";
import { createNotification } from "./notifications";
import {
    recommendations,
    recommendationComments,
    recommendationUpvotes,
    queries,
    facultyCalendars,
    facultyEvents,
    academicEvents,
    notifications,
    profiles,
    insertRecommendationSchema,
    insertCommentSchema,
    insertQuerySchema,
    respondQuerySchema,
    insertFacultyEventSchema,
    insertAcademicEventSchema,
} from "../shared/schema";
import { eq, desc, sql, and, gte, lte, ilike, asc } from "drizzle-orm";

const router = Router();

// ==================== RECOMMENDATIONS ====================

// List all recommendations
router.get("/api/recommendations", requireAuth, async (req, res) => {
    try {
        const recs = await db
            .select({
                id: recommendations.id,
                title: recommendations.title,
                category: recommendations.category,
                rating: recommendations.rating,
                location: recommendations.location,
                description: recommendations.description,
                authorId: recommendations.authorId,
                createdAt: recommendations.createdAt,
                authorName: profiles.fullName,
            })
            .from(recommendations)
            .leftJoin(profiles, eq(recommendations.authorId, profiles.id))
            .orderBy(desc(recommendations.createdAt));

        // Get comment counts and upvote counts
        const result = await Promise.all(
            recs.map(async (rec) => {
                const [commentCount] = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(recommendationComments)
                    .where(eq(recommendationComments.recommendationId, rec.id));

                const [upvoteCount] = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(recommendationUpvotes)
                    .where(eq(recommendationUpvotes.recommendationId, rec.id));

                // Check if current user has upvoted
                const userId = (req as any).user.id;
                const [userUpvote] = await db
                    .select()
                    .from(recommendationUpvotes)
                    .where(
                        and(
                            eq(recommendationUpvotes.recommendationId, rec.id),
                            eq(recommendationUpvotes.userId, userId)
                        )
                    )
                    .limit(1);

                return {
                    ...rec,
                    commentCount: commentCount?.count || 0,
                    upvoteCount: upvoteCount?.count || 0,
                    hasUpvoted: !!userUpvote,
                };
            })
        );

        res.json(result);
    } catch (error) {
        console.error("List recommendations error:", error);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

// Get single recommendation with comments
router.get("/api/recommendations/:id", requireAuth, async (req, res) => {
    try {
        const [rec] = await db
            .select({
                id: recommendations.id,
                title: recommendations.title,
                category: recommendations.category,
                rating: recommendations.rating,
                location: recommendations.location,
                description: recommendations.description,
                authorId: recommendations.authorId,
                createdAt: recommendations.createdAt,
                authorName: profiles.fullName,
            })
            .from(recommendations)
            .leftJoin(profiles, eq(recommendations.authorId, profiles.id))
            .where(eq(recommendations.id, req.params.id))
            .limit(1);

        if (!rec) {
            return res.status(404).json({ error: "Recommendation not found" });
        }

        const comments = await db
            .select({
                id: recommendationComments.id,
                content: recommendationComments.content,
                authorId: recommendationComments.authorId,
                createdAt: recommendationComments.createdAt,
                authorName: profiles.fullName,
            })
            .from(recommendationComments)
            .leftJoin(profiles, eq(recommendationComments.authorId, profiles.id))
            .where(eq(recommendationComments.recommendationId, req.params.id))
            .orderBy(desc(recommendationComments.createdAt));

        const [upvoteCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(recommendationUpvotes)
            .where(eq(recommendationUpvotes.recommendationId, req.params.id));

        const userId = (req as any).user.id;
        const [userUpvote] = await db
            .select()
            .from(recommendationUpvotes)
            .where(
                and(
                    eq(recommendationUpvotes.recommendationId, req.params.id),
                    eq(recommendationUpvotes.userId, userId)
                )
            )
            .limit(1);

        res.json({
            ...rec,
            comments,
            upvoteCount: upvoteCount?.count || 0,
            hasUpvoted: !!userUpvote,
        });
    } catch (error) {
        console.error("Get recommendation error:", error);
        res.status(500).json({ error: "Failed to fetch recommendation" });
    }
});

// Create recommendation (+5 points)
router.post("/api/recommendations", requireAuth, async (req, res) => {
    try {
        const parsed = insertRecommendationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const user = (req as any).user;
        const [rec] = await db
            .insert(recommendations)
            .values({ ...parsed.data, authorId: user.id })
            .returning();

        // Award 5 points
        await db
            .update(profiles)
            .set({ points: sql`${profiles.points} + 5` })
            .where(eq(profiles.id, user.id));

        res.status(201).json(rec);
    } catch (error) {
        console.error("Create recommendation error:", error);
        res.status(500).json({ error: "Failed to create recommendation" });
    }
});

// Add comment (+3 points)
router.post(
    "/api/recommendations/:id/comments",
    requireAuth,
    async (req, res) => {
        try {
            const parsed = insertCommentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors[0].message });
            }

            const user = (req as any).user;
            const [comment] = await db
                .insert(recommendationComments)
                .values({
                    content: parsed.data.content,
                    authorId: user.id,
                    recommendationId: req.params.id,
                })
                .returning();

            // Award 3 points to commenter
            await db
                .update(profiles)
                .set({ points: sql`${profiles.points} + 3` })
                .where(eq(profiles.id, user.id));

            // Notify recommendation author
            const [rec] = await db
                .select()
                .from(recommendations)
                .where(eq(recommendations.id, req.params.id))
                .limit(1);

            if (rec && rec.authorId !== user.id) {
                await createNotification(
                    rec.authorId,
                    "New Comment",
                    `${user.fullName} commented on your recommendation "${rec.title}"`
                );
            }

            res.status(201).json(comment);
        } catch (error) {
            console.error("Add comment error:", error);
            res.status(500).json({ error: "Failed to add comment" });
        }
    }
);

// Toggle upvote (+1 point to recommendation author)
router.post(
    "/api/recommendations/:id/upvote",
    requireAuth,
    async (req, res) => {
        try {
            const user = (req as any).user;
            const recId = req.params.id;

            // Check if already upvoted
            const [existing] = await db
                .select()
                .from(recommendationUpvotes)
                .where(
                    and(
                        eq(recommendationUpvotes.recommendationId, recId),
                        eq(recommendationUpvotes.userId, user.id)
                    )
                )
                .limit(1);

            if (existing) {
                // Remove upvote
                await db
                    .delete(recommendationUpvotes)
                    .where(eq(recommendationUpvotes.id, existing.id));

                // Remove 1 point from author
                const [rec] = await db
                    .select()
                    .from(recommendations)
                    .where(eq(recommendations.id, recId))
                    .limit(1);
                if (rec) {
                    await db
                        .update(profiles)
                        .set({ points: sql`GREATEST(${profiles.points} - 1, 0)` })
                        .where(eq(profiles.id, rec.authorId));
                }

                return res.json({ upvoted: false });
            }

            // Add upvote
            await db
                .insert(recommendationUpvotes)
                .values({ userId: user.id, recommendationId: recId });

            // Award 1 point to author
            const [rec] = await db
                .select()
                .from(recommendations)
                .where(eq(recommendations.id, recId))
                .limit(1);
            if (rec) {
                await db
                    .update(profiles)
                    .set({ points: sql`${profiles.points} + 1` })
                    .where(eq(profiles.id, rec.authorId));

                if (rec.authorId !== user.id) {
                    await createNotification(
                        rec.authorId,
                        "New Upvote",
                        `${user.fullName} upvoted your recommendation "${rec.title}"`
                    );
                }
            }

            res.json({ upvoted: true });
        } catch (error) {
            console.error("Upvote error:", error);
            res.status(500).json({ error: "Failed to toggle upvote" });
        }
    }
);

// ==================== QUERIES ====================

// List queries
router.get("/api/queries", requireAuth, async (req, res) => {
    try {
        const result = await db
            .select({
                id: queries.id,
                title: queries.title,
                description: queries.description,
                type: queries.type,
                status: queries.status,
                response: queries.response,
                authorId: queries.authorId,
                responderId: queries.responderId,
                createdAt: queries.createdAt,
                authorName: profiles.fullName,
            })
            .from(queries)
            .leftJoin(profiles, eq(queries.authorId, profiles.id))
            .orderBy(desc(queries.createdAt));

        res.json(result);
    } catch (error) {
        console.error("List queries error:", error);
        res.status(500).json({ error: "Failed to fetch queries" });
    }
});

// Create query (+3 points)
router.post("/api/queries", requireAuth, async (req, res) => {
    try {
        const parsed = insertQuerySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const user = (req as any).user;
        const [query] = await db
            .insert(queries)
            .values({ ...parsed.data, authorId: user.id })
            .returning();

        // Award 3 points
        await db
            .update(profiles)
            .set({ points: sql`${profiles.points} + 3` })
            .where(eq(profiles.id, user.id));

        res.status(201).json(query);
    } catch (error) {
        console.error("Create query error:", error);
        res.status(500).json({ error: "Failed to create query" });
    }
});

// Respond to query (HOD/Dean/Superadmin)
router.patch(
    "/api/queries/:id/respond",
    requireAuth,
    requireRole("hod", "dean", "superadmin"),
    async (req, res) => {
        try {
            const parsed = respondQuerySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors[0].message });
            }

            const user = (req as any).user;
            const [updated] = await db
                .update(queries)
                .set({
                    response: parsed.data.response,
                    status: parsed.data.status,
                    responderId: user.id,
                })
                .where(eq(queries.id, req.params.id))
                .returning();

            if (!updated) {
                return res.status(404).json({ error: "Query not found" });
            }

            // Notify query author
            await createNotification(
                updated.authorId,
                "Query Updated",
                `Your query "${updated.title}" has been ${updated.status === "resolved" ? "resolved" : "updated"} by ${user.fullName}`
            );

            res.json(updated);
        } catch (error) {
            console.error("Respond to query error:", error);
            res.status(500).json({ error: "Failed to respond to query" });
        }
    }
);

// ==================== LEADERBOARD ====================

router.get("/api/leaderboard", requireAuth, async (req, res) => {
    try {
        const result = await db
            .select({
                id: profiles.id,
                fullName: profiles.fullName,
                role: profiles.role,
                points: profiles.points,
            })
            .from(profiles)
            .orderBy(desc(profiles.points))
            .limit(50);

        res.json(result);
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// ==================== FACULTY CALENDAR ====================

// Get faculty calendar
router.get("/api/faculty-calendar", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const calendars = await db
            .select()
            .from(facultyCalendars)
            .where(eq(facultyCalendars.facultyId, user.id))
            .orderBy(desc(facultyCalendars.uploadedAt));

        const events = await db
            .select()
            .from(facultyEvents)
            .where(eq(facultyEvents.facultyId, user.id))
            .orderBy(asc(facultyEvents.eventDate));

        res.json({ calendars, events });
    } catch (error) {
        console.error("Faculty calendar error:", error);
        res.status(500).json({ error: "Failed to fetch faculty calendar" });
    }
});

// Upload calendar image
router.post("/api/faculty-calendar/upload", requireAuth, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Image data is required" });
        }

        const user = (req as any).user;
        const [calendar] = await db
            .insert(facultyCalendars)
            .values({ facultyId: user.id, image })
            .returning();

        res.status(201).json(calendar);
    } catch (error) {
        console.error("Upload calendar error:", error);
        res.status(500).json({ error: "Failed to upload calendar" });
    }
});

// Delete calendar image
router.delete(
    "/api/faculty-calendar/:id",
    requireAuth,
    async (req, res) => {
        try {
            const user = (req as any).user;
            await db
                .delete(facultyCalendars)
                .where(
                    and(
                        eq(facultyCalendars.id, req.params.id),
                        eq(facultyCalendars.facultyId, user.id)
                    )
                );
            res.json({ message: "Calendar deleted" });
        } catch (error) {
            console.error("Delete calendar error:", error);
            res.status(500).json({ error: "Failed to delete calendar" });
        }
    }
);

// Add faculty event
router.post("/api/faculty-events", requireAuth, async (req, res) => {
    try {
        const parsed = insertFacultyEventSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const user = (req as any).user;
        const [event] = await db
            .insert(facultyEvents)
            .values({ ...parsed.data, facultyId: user.id })
            .returning();

        res.status(201).json(event);
    } catch (error) {
        console.error("Create faculty event error:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// Delete faculty event
router.delete("/api/faculty-events/:id", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        await db
            .delete(facultyEvents)
            .where(
                and(
                    eq(facultyEvents.id, req.params.id),
                    eq(facultyEvents.facultyId, user.id)
                )
            );
        res.json({ message: "Event deleted" });
    } catch (error) {
        console.error("Delete faculty event error:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

// ==================== ACADEMIC CALENDAR ====================

// List academic events
router.get("/api/academic-events", requireAuth, async (req, res) => {
    try {
        const { month, search } = req.query;

        let query = db
            .select({
                id: academicEvents.id,
                title: academicEvents.title,
                description: academicEvents.description,
                startDate: academicEvents.startDate,
                endDate: academicEvents.endDate,
                category: academicEvents.category,
                createdBy: academicEvents.createdBy,
                createdAt: academicEvents.createdAt,
                creatorName: profiles.fullName,
            })
            .from(academicEvents)
            .leftJoin(profiles, eq(academicEvents.createdBy, profiles.id))
            .orderBy(asc(academicEvents.startDate))
            .$dynamic();

        const conditions = [];

        if (month && typeof month === "string") {
            const [year, mon] = month.split("-");
            const startOfMonth = `${year}-${mon}-01`;
            const endOfMonth = new Date(
                parseInt(year),
                parseInt(mon),
                0
            )
                .toISOString()
                .split("T")[0];
            conditions.push(gte(academicEvents.startDate, startOfMonth));
            conditions.push(lte(academicEvents.startDate, endOfMonth));
        }

        if (search && typeof search === "string") {
            conditions.push(ilike(academicEvents.title, `%${search}%`));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        const result = await query;
        res.json(result);
    } catch (error) {
        console.error("List academic events error:", error);
        res.status(500).json({ error: "Failed to fetch academic events" });
    }
});

// Create academic event (superadmin only)
router.post(
    "/api/academic-events",
    requireAuth,
    requireRole("superadmin"),
    async (req, res) => {
        try {
            const parsed = insertAcademicEventSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors[0].message });
            }

            const user = (req as any).user;
            const [event] = await db
                .insert(academicEvents)
                .values({ ...parsed.data, createdBy: user.id })
                .returning();

            // Notify all users about new academic event
            const allUsers = await db.select({ id: profiles.id }).from(profiles);
            for (const u of allUsers) {
                if (u.id !== user.id) {
                    await createNotification(
                        u.id,
                        "New Academic Event",
                        `A new academic event "${event.title}" has been added.`
                    );
                }
            }

            res.status(201).json(event);
        } catch (error) {
            console.error("Create academic event error:", error);
            res.status(500).json({ error: "Failed to create academic event" });
        }
    }
);

// Delete academic event
router.delete(
    "/api/academic-events/:id",
    requireAuth,
    requireRole("superadmin"),
    async (req, res) => {
        try {
            await db
                .delete(academicEvents)
                .where(eq(academicEvents.id, req.params.id));
            res.json({ message: "Event deleted" });
        } catch (error) {
            console.error("Delete academic event error:", error);
            res.status(500).json({ error: "Failed to delete event" });
        }
    }
);

// ==================== NOTIFICATIONS ====================

// Get notifications for current user
router.get("/api/notifications", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const result = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        res.json(result);
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Get unread count
router.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const [result] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, user.id),
                    eq(notifications.isRead, false)
                )
            );

        res.json({ count: result?.count || 0 });
    } catch (error) {
        console.error("Unread count error:", error);
        res.status(500).json({ error: "Failed to fetch unread count" });
    }
});

// Mark notification as read
router.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, req.params.id),
                    eq(notifications.userId, user.id)
                )
            );
        res.json({ message: "Marked as read" });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ error: "Failed to mark notification" });
    }
});

// Mark all as read
router.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, user.id));
        res.json({ message: "All marked as read" });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ error: "Failed to mark all as read" });
    }
});

// ==================== DASHBOARD STATS ====================

router.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;

        const [recCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(recommendations)
            .where(eq(recommendations.authorId, user.id));

        const [queryCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(queries)
            .where(eq(queries.authorId, user.id));

        const [profile] = await db
            .select({ points: profiles.points })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

        // Recent activity - last 5 recommendations + queries
        const recentRecs = await db
            .select({
                id: recommendations.id,
                title: recommendations.title,
                type: sql<string>`'recommendation'`,
                createdAt: recommendations.createdAt,
                authorName: profiles.fullName,
            })
            .from(recommendations)
            .leftJoin(profiles, eq(recommendations.authorId, profiles.id))
            .orderBy(desc(recommendations.createdAt))
            .limit(5);

        const recentQueries = await db
            .select({
                id: queries.id,
                title: queries.title,
                type: sql<string>`'query'`,
                createdAt: queries.createdAt,
                authorName: profiles.fullName,
            })
            .from(queries)
            .leftJoin(profiles, eq(queries.authorId, profiles.id))
            .orderBy(desc(queries.createdAt))
            .limit(5);

        const recentActivity = [...recentRecs, ...recentQueries]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

        // Leaderboard top 5
        const leaderboard = await db
            .select({
                id: profiles.id,
                fullName: profiles.fullName,
                points: profiles.points,
            })
            .from(profiles)
            .orderBy(desc(profiles.points))
            .limit(5);

        // Upcoming events
        const today = new Date().toISOString().split("T")[0];
        const upcomingEvents = await db
            .select()
            .from(facultyEvents)
            .where(
                and(
                    eq(facultyEvents.facultyId, user.id),
                    gte(facultyEvents.eventDate, today)
                )
            )
            .orderBy(asc(facultyEvents.eventDate))
            .limit(5);

        res.json({
            points: profile?.points || 0,
            recommendationCount: recCount?.count || 0,
            queryCount: queryCount?.count || 0,
            recentActivity,
            leaderboard,
            upcomingEvents,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

export default router;
