import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import { NotificationDropdown } from "./NotificationDropdown";
import {
    LayoutDashboard,
    Star,
    HelpCircle,
    Trophy,
    Calendar,
    CalendarDays,
    Brain,
    Menu,
    X,
    LogOut,
} from "lucide-react";

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Recommendations", path: "/recommendations", icon: <Star size={18} /> },
    { label: "Queries", path: "/queries", icon: <HelpCircle size={18} /> },
    { label: "Leaderboard", path: "/leaderboard", icon: <Trophy size={18} /> },
    { label: "My Calendar", path: "/calendar", icon: <Calendar size={18} /> },
    { label: "Academic Calendar", path: "/academic-calendar", icon: <CalendarDays size={18} /> },
    { label: "AI Insights", path: "/insights", icon: <Brain size={18} />, roles: ["dean", "superadmin"] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthContext();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const filteredItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role))
    );

    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            faculty: "Faculty",
            hod: "HOD",
            dean: "Dean",
            superadmin: "Super Admin",
        };
        return labels[role] || role;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Left — Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <Menu size={20} className="text-gray-600" />
                            </button>
                            <Link to="/" className="flex items-center gap-2.5">
                                <img src="/srmap-logo.png" alt="SRM AP" className="h-8 w-auto" />
                                <span className="text-lg font-bold text-gray-900 tracking-tight">ACADLY</span>
                            </Link>
                        </div>

                        {/* Right — Notifications, Profile, Logout */}
                        <div className="flex items-center gap-1">
                            <NotificationDropdown />
                            <div className="hidden sm:flex items-center gap-2.5 ml-2 pl-3 border-l border-gray-200">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500">{roleLabel(user?.role || "")}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700 ml-1"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar (desktop) */}
                <aside className="hidden lg:block w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 sticky top-14 self-start">
                    <nav className="py-3">
                        {filteredItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? "bg-gray-100 text-gray-900 font-semibold border-r-2 border-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                                {user?.points || 0} pts
                            </span>
                        </div>
                    </div>
                </aside>

                {/* Mobile drawer */}
                {drawerOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/30 z-50 lg:hidden"
                            onClick={() => setDrawerOpen(false)}
                        />
                        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-lg border-r border-gray-200 lg:hidden animate-slide-in">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <img src="/srmap-logo.png" alt="SRM AP" className="h-7 w-auto" />
                                    <span className="text-base font-bold text-gray-900">ACADLY</span>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
                                        {user?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500">{roleLabel(user?.role || "")}</p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded">{user?.points || 0} pts</span>
                                </div>
                            </div>
                            <nav className="py-2">
                                {filteredItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setDrawerOpen(false)}
                                            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${isActive
                                                ? "bg-gray-100 text-gray-900 font-semibold"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Main content */}
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
