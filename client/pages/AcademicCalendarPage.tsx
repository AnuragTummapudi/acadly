import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuthContext } from "../providers/AuthProvider";
import {
    CalendarDays,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Trash2,
    Tag,
} from "lucide-react";

const eventSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    category: z.string().min(1, "Category is required"),
});

type EventForm = z.infer<typeof eventSchema>;

const eventCategories = [
    "Exam",
    "Holiday",
    "Workshop",
    "Seminar",
    "Conference",
    "Meeting",
    "Deadline",
    "Cultural",
    "Sports",
    "Other",
];

const categoryColors: Record<string, string> = {
    Exam: "bg-red-100 text-red-700 border-red-300",
    Holiday: "bg-green-100 text-green-700 border-green-300",
    Workshop: "bg-blue-100 text-blue-700 border-blue-300",
    Seminar: "bg-purple-100 text-purple-700 border-purple-300",
    Conference: "bg-indigo-100 text-indigo-700 border-indigo-300",
    Meeting: "bg-gray-100 text-gray-700 border-gray-300",
    Deadline: "bg-orange-100 text-orange-700 border-orange-300",
    Cultural: "bg-pink-100 text-pink-700 border-pink-300",
    Sports: "bg-cyan-100 text-cyan-700 border-cyan-300",
    Other: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function AcademicCalendarPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });

    const isSuperAdmin = user?.role === "superadmin";

    const { data: events = [], isLoading } = useQuery({
        queryKey: ["academic-events", currentMonth, searchQuery],
        queryFn: () => {
            const params = new URLSearchParams();
            if (currentMonth) params.set("month", currentMonth);
            if (searchQuery) params.set("search", searchQuery);
            return api.get(`/api/academic-events?${params}`);
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: EventForm) => api.post("/api/academic-events", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["academic-events"] });
            setShowCreate(false);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/academic-events/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["academic-events"] }),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EventForm>({
        resolver: zodResolver(eventSchema),
    });

    const navigateMonth = (dir: number) => {
        const [y, m] = currentMonth.split("-").map(Number);
        const d = new Date(y, m - 1 + dir, 1);
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    };

    const monthLabel = () => {
        const [y, m] = currentMonth.split("-").map(Number);
        return new Date(y, m - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="page-title !mb-0">Academic Calendar</h1>
                {isSuperAdmin && (
                    <button onClick={() => setShowCreate(true)} className="neo-btn-primary flex items-center gap-2">
                        <Plus size={16} /> Add Event
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {/* Month navigation */}
                <div className="flex items-center gap-2 neo-card !p-1.5 !shadow-neo-sm">
                    <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-semibold min-w-[140px] text-center">{monthLabel()}</span>
                    <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="neo-input !pl-9"
                        placeholder="Search events..."
                    />
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="neo-card w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Add Academic Event</h2>
                            <button onClick={() => { setShowCreate(false); reset(); }} className="p-1 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Title</label>
                                <input {...register("title")} className="neo-input" placeholder="e.g. Mid-Term Exams" />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Category</label>
                                <select {...register("category")} className="neo-select">
                                    <option value="">Select category</option>
                                    {eventCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Description</label>
                                <textarea {...register("description")} className="neo-textarea" placeholder="Optional details" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">Start Date</label>
                                    <input {...register("startDate")} type="date" className="neo-input" />
                                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">End Date</label>
                                    <input {...register("endDate")} type="date" className="neo-input" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="neo-btn-primary flex-1" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Adding..." : "Add Event"}
                                </button>
                                <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="neo-btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Event List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />)}
                </div>
            ) : events.length === 0 ? (
                <div className="neo-card !p-12 text-center">
                    <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No events this month</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different month or search term</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((event: any) => (
                        <div key={event.id} className="neo-card flex items-start gap-4">
                            <div className="w-14 h-14 bg-amber-100 border-2 border-black flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold">
                                    {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="text-xl font-black leading-none">
                                    {new Date(event.startDate).getDate()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-sm">{event.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 border rounded-sm font-semibold ${categoryColors[event.category] || categoryColors.Other
                                        }`}>
                                        {event.category}
                                    </span>
                                </div>
                                {event.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                    <span>
                                        {new Date(event.startDate).toLocaleDateString()}
                                        {event.endDate && ` — ${new Date(event.endDate).toLocaleDateString()}`}
                                    </span>
                                    {event.creatorName && <span>by {event.creatorName}</span>}
                                </div>
                            </div>
                            {isSuperAdmin && (
                                <button
                                    onClick={() => deleteMutation.mutate(event.id)}
                                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
