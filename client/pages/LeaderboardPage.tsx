import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthContext } from "../providers/AuthProvider";
import { Trophy, Medal, Award } from "lucide-react";

export default function LeaderboardPage() {
    const { user } = useAuthContext();

    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ["leaderboard"],
        queryFn: () => api.get("/api/leaderboard"),
    });

    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            faculty: "Faculty",
            hod: "HOD",
            dean: "Dean",
            superadmin: "Admin",
        };
        return labels[role] || role;
    };

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 w-48 rounded" />
                    {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Leaderboard</h1>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl mx-auto">
                    {/* 2nd place */}
                    <div className="neo-card !bg-gray-50 text-center mt-6">
                        <div className="w-12 h-12 mx-auto bg-gray-300 border-2 border-black rounded-full flex items-center justify-center text-lg font-black mb-2">
                            {leaderboard[1].fullName.charAt(0)}
                        </div>
                        <Medal size={20} className="mx-auto text-gray-500 mb-1" />
                        <p className="text-sm font-bold truncate">{leaderboard[1].fullName}</p>
                        <p className="text-xs text-gray-500">{roleLabel(leaderboard[1].role)}</p>
                        <p className="text-xl font-black mt-1">{leaderboard[1].points}</p>
                        <p className="text-xs text-gray-400">points</p>
                    </div>

                    {/* 1st place */}
                    <div className="neo-leaderboard-top text-center">
                        <div className="w-14 h-14 mx-auto bg-amber-400 border-2 border-black rounded-full flex items-center justify-center text-xl font-black mb-2">
                            {leaderboard[0].fullName.charAt(0)}
                        </div>
                        <Trophy size={24} className="mx-auto text-amber-600 mb-1" />
                        <p className="text-sm font-bold truncate">{leaderboard[0].fullName}</p>
                        <p className="text-xs text-gray-500">{roleLabel(leaderboard[0].role)}</p>
                        <p className="text-2xl font-black mt-1">{leaderboard[0].points}</p>
                        <p className="text-xs text-gray-400">points</p>
                    </div>

                    {/* 3rd place */}
                    <div className="neo-card !bg-orange-50 text-center mt-6">
                        <div className="w-12 h-12 mx-auto bg-orange-200 border-2 border-black rounded-full flex items-center justify-center text-lg font-black mb-2">
                            {leaderboard[2].fullName.charAt(0)}
                        </div>
                        <Award size={20} className="mx-auto text-orange-500 mb-1" />
                        <p className="text-sm font-bold truncate">{leaderboard[2].fullName}</p>
                        <p className="text-xs text-gray-500">{roleLabel(leaderboard[2].role)}</p>
                        <p className="text-xl font-black mt-1">{leaderboard[2].points}</p>
                        <p className="text-xs text-gray-400">points</p>
                    </div>
                </div>
            )}

            {/* Full Rankings */}
            <div className="space-y-2">
                {leaderboard.map((person: any, index: number) => (
                    <div
                        key={person.id}
                        className={`flex items-center gap-4 p-4 ${index < 3 ? "neo-leaderboard-top" : "neo-card"
                            } ${person.id === user?.id ? "!border-amber-500" : ""}`}
                    >
                        <span
                            className={`w-8 h-8 flex items-center justify-center text-sm font-black flex-shrink-0 border-2 border-black ${index === 0
                                    ? "bg-amber-400"
                                    : index === 1
                                        ? "bg-gray-300"
                                        : index === 2
                                            ? "bg-orange-300"
                                            : "bg-white"
                                }`}
                        >
                            {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {person.fullName}
                                {person.id === user?.id && (
                                    <span className="text-xs text-gray-400 ml-1">(you)</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500">{roleLabel(person.role)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-lg font-black">{person.points}</p>
                            <p className="text-xs text-gray-400">pts</p>
                        </div>
                    </div>
                ))}
            </div>

            {leaderboard.length === 0 && (
                <div className="neo-card !p-12 text-center">
                    <Trophy size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No rankings yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start engaging to appear on the leaderboard!</p>
                </div>
            )}
        </div>
    );
}
