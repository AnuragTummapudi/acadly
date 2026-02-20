import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthContext } from "../providers/AuthProvider";
import { Link } from "react-router-dom";
import {
    Star,
    HelpCircle,
    Trophy,
    TrendingUp,
    Calendar,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuthContext();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: () => api.get("/api/dashboard/stats"),
    });

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-7 bg-gray-100 w-56 rounded" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {user?.fullName?.split(" ")[0]}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Here's your engagement overview
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Points</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.points || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recommendations</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.recommendationCount || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Star size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Queries Raised</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.queryCount || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                            <HelpCircle size={20} className="text-violet-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engagement</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {((stats?.recommendationCount || 0) + (stats?.queryCount || 0)) > 0 ? "Active" : "New"}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between px-5 py-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "recommendation" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                                            }`}>
                                            {item.type === "recommendation" ? (
                                                <Star size={14} />
                                            ) : (
                                                <HelpCircle size={14} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">by {item.authorName}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 ${item.type === "recommendation" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                                        }`}>
                                        {item.type === "recommendation" ? "Rec" : "Query"}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-12 text-center text-gray-400">
                                <p className="text-sm">No recent activity yet</p>
                                <p className="text-xs mt-1">Start by creating a recommendation or query</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Leaderboard Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Top Faculty</h2>
                            <Link to="/leaderboard" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
                            {stats?.leaderboard?.length > 0 ? (
                                stats.leaderboard.map((person: any, index: number) => (
                                    <div
                                        key={person.id}
                                        className={`flex items-center gap-3 px-4 py-3 ${index === 0 ? "bg-amber-50/50" : ""}`}
                                    >
                                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-700" :
                                                index === 1 ? "bg-gray-100 text-gray-600" :
                                                    index === 2 ? "bg-orange-50 text-orange-500" :
                                                        "bg-gray-50 text-gray-400"
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-gray-800 flex-1 truncate">{person.fullName}</span>
                                        <span className="text-sm font-semibold text-gray-900">{person.points}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    No data yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
                            <Link to="/calendar" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                Calendar <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
                            {stats?.upcomingEvents?.length > 0 ? (
                                stats.upcomingEvents.map((event: any) => (
                                    <div key={event.id} className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-800">{event.title}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Calendar size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {new Date(event.eventDate).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    No upcoming events
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link to="/recommendations" className="neo-btn-primary w-full flex items-center justify-center gap-2 text-sm">
                                <Star size={14} /> New Recommendation
                            </Link>
                            <Link to="/queries" className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                                <HelpCircle size={14} /> Submit Query
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
