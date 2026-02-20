import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    date,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== PROFILES ====================
export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 })
        .notNull()
        .default("faculty")
        .$type<"faculty" | "hod" | "dean" | "superadmin">(),
    points: integer("points").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
    recommendations: many(recommendations),
    recommendationComments: many(recommendationComments),
    recommendationUpvotes: many(recommendationUpvotes),
    queries: many(queries),
    facultyCalendars: many(facultyCalendars),
    facultyEvents: many(facultyEvents),
    notifications: many(notifications),
}));

// ==================== RECOMMENDATIONS ====================
export const recommendations = pgTable("recommendations", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    rating: integer("rating").notNull().default(5),
    location: varchar("location", { length: 255 }),
    description: text("description").notNull(),
    authorId: uuid("author_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendationsRelations = relations(
    recommendations,
    ({ one, many }) => ({
        author: one(profiles, {
            fields: [recommendations.authorId],
            references: [profiles.id],
        }),
        comments: many(recommendationComments),
        upvotes: many(recommendationUpvotes),
    })
);

// ==================== RECOMMENDATION COMMENTS ====================
export const recommendationComments = pgTable("recommendation_comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    authorId: uuid("author_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    recommendationId: uuid("recommendation_id")
        .notNull()
        .references(() => recommendations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendationCommentsRelations = relations(
    recommendationComments,
    ({ one }) => ({
        author: one(profiles, {
            fields: [recommendationComments.authorId],
            references: [profiles.id],
        }),
        recommendation: one(recommendations, {
            fields: [recommendationComments.recommendationId],
            references: [recommendations.id],
        }),
    })
);

// ==================== RECOMMENDATION UPVOTES ====================
export const recommendationUpvotes = pgTable(
    "recommendation_upvotes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => profiles.id, { onDelete: "cascade" }),
        recommendationId: uuid("recommendation_id")
            .notNull()
            .references(() => recommendations.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("unique_upvote").on(table.userId, table.recommendationId),
    ]
);

export const recommendationUpvotesRelations = relations(
    recommendationUpvotes,
    ({ one }) => ({
        user: one(profiles, {
            fields: [recommendationUpvotes.userId],
            references: [profiles.id],
        }),
        recommendation: one(recommendations, {
            fields: [recommendationUpvotes.recommendationId],
            references: [recommendations.id],
        }),
    })
);

// ==================== QUERIES ====================
export const queries = pgTable("queries", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 })
        .notNull()
        .default("open")
        .$type<"open" | "in_progress" | "resolved">(),
    response: text("response"),
    authorId: uuid("author_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    responderId: uuid("responder_id").references(() => profiles.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const queriesRelations = relations(queries, ({ one }) => ({
    author: one(profiles, {
        fields: [queries.authorId],
        references: [profiles.id],
        relationName: "queryAuthor",
    }),
    responder: one(profiles, {
        fields: [queries.responderId],
        references: [profiles.id],
        relationName: "queryResponder",
    }),
}));

// ==================== FACULTY CALENDARS ====================
export const facultyCalendars = pgTable("faculty_calendars", {
    id: uuid("id").defaultRandom().primaryKey(),
    facultyId: uuid("faculty_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    image: text("image").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const facultyCalendarsRelations = relations(
    facultyCalendars,
    ({ one }) => ({
        faculty: one(profiles, {
            fields: [facultyCalendars.facultyId],
            references: [profiles.id],
        }),
    })
);

// ==================== FACULTY EVENTS ====================
export const facultyEvents = pgTable("faculty_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    facultyId: uuid("faculty_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    eventDate: date("event_date").notNull(),
    reminderDate: date("reminder_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const facultyEventsRelations = relations(facultyEvents, ({ one }) => ({
    faculty: one(profiles, {
        fields: [facultyEvents.facultyId],
        references: [profiles.id],
    }),
}));

// ==================== ACADEMIC EVENTS ====================
export const academicEvents = pgTable("academic_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    category: varchar("category", { length: 100 }).notNull(),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const academicEventsRelations = relations(
    academicEvents,
    ({ one }) => ({
        creator: one(profiles, {
            fields: [academicEvents.createdBy],
            references: [profiles.id],
        }),
    })
);

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(profiles, {
        fields: [notifications.userId],
        references: [profiles.id],
    }),
}));

// ==================== ZOD SCHEMAS ====================
export const insertProfileSchema = createInsertSchema(profiles).omit({
    id: true,
    createdAt: true,
    passwordHash: true,
    points: true,
});

export const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["faculty", "hod", "dean", "superadmin"]).default("faculty"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const insertRecommendationSchema = createInsertSchema(
    recommendations
).omit({
    id: true,
    createdAt: true,
    authorId: true,
});

export const insertCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
});

export const insertQuerySchema = createInsertSchema(queries).omit({
    id: true,
    createdAt: true,
    authorId: true,
    responderId: true,
    response: true,
    status: true,
});

export const respondQuerySchema = z.object({
    response: z.string().min(1, "Response cannot be empty"),
    status: z.enum(["open", "in_progress", "resolved"]),
});

export const insertFacultyEventSchema = createInsertSchema(facultyEvents).omit({
    id: true,
    createdAt: true,
    facultyId: true,
});

export const insertAcademicEventSchema = createInsertSchema(
    academicEvents
).omit({
    id: true,
    createdAt: true,
    createdBy: true,
});

// ==================== TYPES ====================
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type RecommendationComment = typeof recommendationComments.$inferSelect;
export type RecommendationUpvote = typeof recommendationUpvotes.$inferSelect;
export type Query = typeof queries.$inferSelect;
export type FacultyCalendar = typeof facultyCalendars.$inferSelect;
export type FacultyEvent = typeof facultyEvents.$inferSelect;
export type AcademicEvent = typeof academicEvents.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
