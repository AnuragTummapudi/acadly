import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./providers/AuthProvider";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import QueriesPage from "./pages/QueriesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import FacultyCalendarPage from "./pages/FacultyCalendarPage";
import AcademicCalendarPage from "./pages/AcademicCalendarPage";
import AIInsightsPage from "./pages/AIInsightsPage";

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
    const { user, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight mb-2">ACADLY</h1>
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Layout>{children}</Layout>;
}

export default function App() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight mb-2">ACADLY</h1>
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Auth routes */}
            <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={user ? <Navigate to="/" replace /> : <RegisterPage />}
            />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recommendations"
                element={
                    <ProtectedRoute>
                        <RecommendationsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/queries"
                element={
                    <ProtectedRoute>
                        <QueriesPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leaderboard"
                element={
                    <ProtectedRoute>
                        <LeaderboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/calendar"
                element={
                    <ProtectedRoute>
                        <FacultyCalendarPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/academic-calendar"
                element={
                    <ProtectedRoute>
                        <AcademicCalendarPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insights"
                element={
                    <ProtectedRoute roles={["dean", "superadmin"]}>
                        <AIInsightsPage />
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
