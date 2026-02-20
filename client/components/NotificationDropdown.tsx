import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: unreadData } = useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: () => api.get("/api/notifications/unread-count"),
        refetchInterval: 30000,
    });

    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: () => api.get("/api/notifications"),
        enabled: open,
    });

    const markRead = useMutation({
        mutationFn: (id: string) => api.patch(`/api/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });

    const markAllRead = useMutation({
        mutationFn: () => api.patch("/api/notifications/read-all"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = unreadData?.count || 0;

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead.mutate()}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-gray-400 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? "bg-blue-50/40" : ""
                                    }`}
                                onClick={() => !n.isRead && markRead.mutate(n.id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
