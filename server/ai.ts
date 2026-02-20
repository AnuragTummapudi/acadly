import { Router } from "express";
import { requireAuth, requireRole } from "./middleware";
import { db } from "./db";
import { recommendations, queries, profiles, recommendationComments, recommendationUpvotes } from "../shared/schema";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get(
    "/api/ai/insights",
    requireAuth,
    requireRole("dean", "superadmin"),
    async (req, res) => {
        try {
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
                return res.json({
                    available: false,
                    message: "AI insights are unavailable. GEMINI_API_KEY not configured.",
                    fallback: await generateFallbackInsights(),
                });
            }

            // Gather data for analysis
            const allQueries = await db
                .select({
                    title: queries.title,
                    type: queries.type,
                    status: queries.status,
                    createdAt: queries.createdAt,
                })
                .from(queries)
                .orderBy(desc(queries.createdAt))
                .limit(100);

            const allRecs = await db
                .select({
                    title: recommendations.title,
                    category: recommendations.category,
                    rating: recommendations.rating,
                    createdAt: recommendations.createdAt,
                })
                .from(recommendations)
                .orderBy(desc(recommendations.createdAt))
                .limit(100);

            const topFaculty = await db
                .select({
                    fullName: profiles.fullName,
                    points: profiles.points,
                    role: profiles.role,
                })
                .from(profiles)
                .orderBy(desc(profiles.points))
                .limit(10);

            const [totalUsers] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(profiles);

            const [totalRecs] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(recommendations);

            const [totalQueries] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(queries);

            const prompt = `You are an analytics expert for a university faculty engagement platform called ACADLY. Analyze the following data and provide insights:

PLATFORM STATISTICS:
- Total Users: ${totalUsers?.count || 0}
- Total Recommendations: ${totalRecs?.count || 0}
- Total Queries: ${totalQueries?.count || 0}

RECENT QUERIES (last 100):
${JSON.stringify(allQueries, null, 2)}

RECENT RECOMMENDATIONS (last 100):
${JSON.stringify(allRecs, null, 2)}

TOP FACULTY:
${JSON.stringify(topFaculty, null, 2)}

Provide the response in this JSON format:
{
  "executiveSummary": "2-3 sentence overview",
  "queryThemes": ["theme1", "theme2", "theme3"],
  "engagementLevel": "high/medium/low with brief explanation",
  "mostActiveAreas": ["area1", "area2"],
  "monthlyTrends": "brief trend analysis",
  "recommendationInsights": "key patterns in recommendations",
  "actionableInsights": ["insight1", "insight2", "insight3"],
  "concerns": ["concern1 if any"]
}`;

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Try to parse as JSON
            let insights;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                insights = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
            } catch {
                insights = { raw: responseText };
            }

            res.json({ available: true, insights });
        } catch (error) {
            console.error("AI insights error:", error);
            res.json({
                available: false,
                message: "AI insights temporarily unavailable.",
                fallback: await generateFallbackInsights(),
            });
        }
    }
);

async function generateFallbackInsights() {
    try {
        const [totalUsers] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(profiles);
        const [totalRecs] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(recommendations);
        const [totalQueries] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(queries);
        const [openQueries] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(queries)
            .where(sql`${queries.status} = 'open'`);
        const [resolvedQueries] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(queries)
            .where(sql`${queries.status} = 'resolved'`);

        const topFaculty = await db
            .select({
                fullName: profiles.fullName,
                points: profiles.points,
            })
            .from(profiles)
            .orderBy(desc(profiles.points))
            .limit(5);

        return {
            executiveSummary: `The platform has ${totalUsers?.count || 0} users with ${totalRecs?.count || 0} recommendations and ${totalQueries?.count || 0} queries submitted.`,
            stats: {
                totalUsers: totalUsers?.count || 0,
                totalRecommendations: totalRecs?.count || 0,
                totalQueries: totalQueries?.count || 0,
                openQueries: openQueries?.count || 0,
                resolvedQueries: resolvedQueries?.count || 0,
            },
            topFaculty,
        };
    } catch {
        return { message: "Unable to generate fallback insights" };
    }
}

export default router;
