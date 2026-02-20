import React, { useState, useMemo } from "react";
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
    "academic",
    "exam",
    "holiday",
    "event",
    "workshop",
    "meeting",
];

const categoryConfig: Record<string, { label: string; color: string; dot: string }> = {
    academic: { label: "Academic", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    exam: { label: "Exam", color: "bg-red-50 text-red-700", dot: "bg-red-500" },
    holiday: { label: "Holiday", color: "bg-green-50 text-green-700", dot: "bg-green-500" },
    event: { label: "Event", color: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
    workshop: { label: "Workshop", color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    meeting: { label: "Meeting", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

export default function AcademicCalendarPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
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
        setSelectedDate(null);
    };

    const [year, month] = currentMonth.split("-").map(Number);
    const monthLabel = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Calendar grid computation
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [year, month]);

    // Map events to dates for calendar dots
    const eventsByDate = useMemo(() => {
        const map: Record<string, any[]> = {};
        events.forEach((e: any) => {
            const day = new Date(e.startDate).getDate();
            const key = String(day);
            if (!map[key]) map[key] = [];
            map[key].push(e);
        });
        return map;
    }, [events]);

    // Filtered events for the list
    const filteredEvents = useMemo(() => {
        let filtered = events;
        if (selectedDate) {
            filtered = filtered.filter((e: any) => {
                const d = new Date(e.startDate).getDate();
                return String(d) === selectedDate;
            });
        }
        if (activeFilter) {
            filtered = filtered.filter((e: any) => e.category === activeFilter);
        }
        return filtered;
    }, [events, selectedDate, activeFilter]);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const todayDate = today.getDate();

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
                    <p className="text-sm text-gray-500 mt-0.5">AY 2025-26 — SRM University AP</p>
                </div>
                {isSuperAdmin && (
                    <button onClick={() => setShowCreate(true)} className="neo-btn-primary flex items-center gap-2 text-sm">
                        <Plus size={16} /> Add Event
                    </button>
                )}
            </div>

            {/* Main grid: Events left, Calendar right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT — Event List (2 cols) */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    {/* Search + Filter */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="Search events..."
                            />
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <button
                            onClick={() => { setActiveFilter(null); setSelectedDate(null); }}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${!activeFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            All
                        </button>
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => { setActiveFilter(activeFilter === key ? null : key); setSelectedDate(null); }}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${activeFilter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                            </button>
                        ))}
                    </div>

                    {/* Selected date label */}
                    {selectedDate && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-gray-700">
                                Showing events for {new Date(year, month - 1, Number(selectedDate)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                            <button onClick={() => setSelectedDate(null)} className="text-xs text-gray-400 hover:text-gray-700 underline">Clear</button>
                        </div>
                    )}

                    {/* Events */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm py-16 text-center">
                            <CalendarDays size={28} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No events {selectedDate ? "on this date" : "this month"}</p>
                            <p className="text-xs text-gray-400 mt-1">Try a different month or search term</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
                            {filteredEvents.map((event: any) => {
                                const cfg = categoryConfig[event.category] || categoryConfig.academic;
                                const startD = new Date(event.startDate);
                                return (
                                    <div key={event.id} className="flex items-start gap-4 px-4 py-3.5">
                                        {/* Date block */}
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0 border border-gray-100">
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none">
                                                {startD.toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 leading-none mt-0.5">
                                                {startD.getDate()}
                                            </span>
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            {event.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
                                            )}
                                            {event.endDate && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Until {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </p>
                                            )}
                                        </div>
                                        {/* Delete */}
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => deleteMutation.mutate(event.id)}
                                                className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors flex-shrink-0"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT — Calendar Grid (1 col) */}
                <div className="order-1 lg:order-2">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sticky top-20">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <ChevronLeft size={18} className="text-gray-500" />
                            </button>
                            <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
                            <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <ChevronRight size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-px">
                            {calendarDays.map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} />;
                                const dayEvents = eventsByDate[String(day)] || [];
                                const isToday = isCurrentMonth && day === todayDate;
                                const isSelected = selectedDate === String(day);
                                const hasEvents = dayEvents.length > 0;

                                // Get unique category dots (max 3)
                                const uniqueCats = [...new Set(dayEvents.map((e: any) => e.category))].slice(0, 3);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(isSelected ? null : String(day))}
                                        className={`relative h-10 flex flex-col items-center justify-center rounded-lg text-sm transition-all ${isSelected
                                                ? "bg-gray-900 text-white font-semibold"
                                                : isToday
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : hasEvents
                                                        ? "hover:bg-gray-100 text-gray-900 font-medium"
                                                        : "text-gray-400 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="text-xs">{day}</span>
                                        {/* Event dots */}
                                        {hasEvents && (
                                            <div className="flex gap-0.5 mt-0.5">
                                                {uniqueCats.map((cat: string) => (
                                                    <span
                                                        key={cat}
                                                        className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : (categoryConfig[cat]?.dot || "bg-gray-400")}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Legend</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {Object.entries(categoryConfig).map(([key, cfg]) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className="text-[10px] text-gray-500">{cfg.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Today button */}
                        <button
                            onClick={() => {
                                const d = new Date();
                                setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
                                setSelectedDate(String(d.getDate()));
                            }}
                            className="w-full mt-3 text-xs font-medium text-gray-500 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Go to Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Add Academic Event</h2>
                            <button onClick={() => { setShowCreate(false); reset(); }} className="p-1 hover:bg-gray-100 rounded">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                <input {...register("title")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" placeholder="e.g. Mid-Term Exams" />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                <select {...register("category")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200">
                                    <option value="">Select category</option>
                                    {eventCategories.map((c) => (
                                        <option key={c} value={c}>{categoryConfig[c]?.label || c}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea {...register("description")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" placeholder="Optional details" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                                    <input {...register("startDate")} type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" />
                                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                                    <input {...register("endDate")} type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="neo-btn-primary flex-1 text-sm" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Adding..." : "Add Event"}
                                </button>
                                <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
