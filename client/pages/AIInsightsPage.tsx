import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
    Brain,
    TrendingUp,
    Users,
    AlertCircle,
    BarChart3,
    Lightbulb,
    MessageSquare,
    Zap,
} from "lucide-react";

export default function AIInsightsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["ai-insights"],
        queryFn: () => api.get("/api/ai/insights"),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="page-container">
                <h1 className="page-title">AI Insights</h1>
                <div className="neo-card !p-12 text-center">
                    <Brain size={32} className="mx-auto text-gray-300 mb-3 animate-pulse" />
                    <p className="text-gray-500 font-medium">Analyzing platform data...</p>
                    <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
                </div>
            </div>
        );
    }

    const isAvailable = data?.available;
    const insights = data?.insights;
    const fallback = data?.fallback;

    return (
        <div className="page-container">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="page-title !mb-0">AI Insights</h1>
                <span className="neo-badge-amber">
                    <Brain size={12} className="mr-1" />
                    {isAvailable ? "Gemini" : "Basic"}
                </span>
            </div>

            {!isAvailable && fallback && (
                <>
                    <div className="neo-card !p-4 mb-6 bg-amber-50 border-amber-400 flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold">AI Unavailable</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {data?.message || "Add GEMINI_API_KEY to .env for full AI analysis"}
                            </p>
                        </div>
                    </div>

                    {/* Fallback Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="neo-stat">
                            <p className="neo-stat-label">Total Users</p>
                            <p className="neo-stat-value">{fallback.stats?.totalUsers || 0}</p>
                        </div>
                        <div className="neo-stat">
                            <p className="neo-stat-label">Recommendations</p>
                            <p className="neo-stat-value">{fallback.stats?.totalRecommendations || 0}</p>
                        </div>
                        <div className="neo-stat">
                            <p className="neo-stat-label">Total Queries</p>
                            <p className="neo-stat-value">{fallback.stats?.totalQueries || 0}</p>
                        </div>
                        <div className="neo-stat">
                            <p className="neo-stat-label">Open Queries</p>
                            <p className="neo-stat-value text-amber-500">{fallback.stats?.openQueries || 0}</p>
                        </div>
                    </div>

                    {fallback.executiveSummary && (
                        <div className="neo-card mb-6">
                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <BarChart3 size={18} /> Summary
                            </h2>
                            <p className="text-sm text-gray-700">{fallback.executiveSummary}</p>
                        </div>
                    )}

                    {fallback.topFaculty?.length > 0 && (
                        <div className="neo-card">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Users size={18} /> Most Active Faculty
                            </h2>
                            <div className="space-y-2">
                                {fallback.topFaculty.map((f: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                                        <span className="text-sm font-medium">{f.fullName}</span>
                                        <span className="text-sm font-bold">{f.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {isAvailable && insights && (
                <div className="space-y-6">
                    {/* Executive Summary */}
                    {(insights.executiveSummary || insights.raw) && (
                        <div className="neo-card">
                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <BarChart3 size={18} /> Executive Summary
                            </h2>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {insights.executiveSummary || insights.raw}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Engagement Level */}
                        {insights.engagementLevel && (
                            <div className="neo-stat">
                                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <TrendingUp size={16} /> Engagement Level
                                </h3>
                                <p className="text-sm text-gray-700">{insights.engagementLevel}</p>
                            </div>
                        )}

                        {/* Monthly Trends */}
                        {insights.monthlyTrends && (
                            <div className="neo-stat">
                                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <BarChart3 size={16} /> Monthly Trends
                                </h3>
                                <p className="text-sm text-gray-700">{insights.monthlyTrends}</p>
                            </div>
                        )}
                    </div>

                    {/* Query Themes */}
                    {insights.queryThemes?.length > 0 && (
                        <div className="neo-card">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <MessageSquare size={18} /> Query Themes
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {insights.queryThemes.map((theme: string, i: number) => (
                                    <span key={i} className="neo-badge-blue">{theme}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Most Active Areas */}
                    {insights.mostActiveAreas?.length > 0 && (
                        <div className="neo-card">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Zap size={18} /> Most Active Areas
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {insights.mostActiveAreas.map((area: string, i: number) => (
                                    <span key={i} className="neo-badge-green">{area}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendation Insights */}
                    {insights.recommendationInsights && (
                        <div className="neo-card">
                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <Lightbulb size={18} /> Recommendation Patterns
                            </h2>
                            <p className="text-sm text-gray-700">{insights.recommendationInsights}</p>
                        </div>
                    )}

                    {/* Actionable Insights */}
                    {insights.actionableInsights?.length > 0 && (
                        <div className="neo-leaderboard-top">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Lightbulb size={18} /> Actionable Insights
                            </h2>
                            <ul className="space-y-2">
                                {insights.actionableInsights.map((insight: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="w-5 h-5 bg-amber-400 border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Concerns */}
                    {insights.concerns?.length > 0 && (
                        <div className="neo-card !border-red-300 !bg-red-50">
                            <h2 className="text-lg font-bold mb-3 text-red-700 flex items-center gap-2">
                                <AlertCircle size={18} /> Concerns
                            </h2>
                            <ul className="space-y-1">
                                {insights.concerns.map((concern: string, i: number) => (
                                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        {concern}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
