import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import {
    Calendar,
    Plus,
    Upload,
    X,
    Trash2,
    Image as ImageIcon,
} from "lucide-react";

const eventSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    eventDate: z.string().min(1, "Date is required"),
    reminderDate: z.string().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

export default function FacultyCalendarPage() {
    const queryClient = useQueryClient();
    const [showAddEvent, setShowAddEvent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["faculty-calendar"],
        queryFn: () => api.get("/api/faculty-calendar"),
    });

    const uploadMutation = useMutation({
        mutationFn: (image: string) => api.post("/api/faculty-calendar/upload", { image }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-calendar"] }),
    });

    const deleteCalMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/faculty-calendar/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-calendar"] }),
    });

    const createEventMutation = useMutation({
        mutationFn: (data: EventForm) => api.post("/api/faculty-events", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty-calendar"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setShowAddEvent(false);
            reset();
        },
    });

    const deleteEventMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/faculty-events/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faculty-calendar"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EventForm>({
        resolver: zodResolver(eventSchema),
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (PNG, JPG)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be under 5MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => uploadMutation.mutate(reader.result as string);
        reader.readAsDataURL(file);
    };

    const calendars = data?.calendars || [];
    const events = data?.events || [];
    const today = new Date().toISOString().split("T")[0];
    const upcomingEvents = events.filter((e: any) => e.eventDate >= today);
    const pastEvents = events.filter((e: any) => e.eventDate < today);

    return (
        <div className="page-container">
            <h1 className="page-title">My Calendar</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Images */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Calendar Images</h2>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="neo-btn-outline text-xs flex items-center gap-1"
                            disabled={uploadMutation.isPending}
                        >
                            <Upload size={14} /> {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </div>
                    {calendars.length === 0 ? (
                        <div className="neo-card !p-8 text-center">
                            <ImageIcon size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">No calendar images uploaded</p>
                            <p className="text-xs text-gray-400 mt-1">Upload a PNG or JPG of your schedule</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {calendars.map((cal: any) => (
                                <div key={cal.id} className="neo-card !p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-gray-500">
                                            Uploaded {new Date(cal.uploadedAt).toLocaleDateString()}
                                        </p>
                                        <button
                                            onClick={() => deleteCalMutation.mutate(cal.id)}
                                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <img src={cal.image} alt="Calendar" className="w-full border-2 border-black" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Events */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">My Events</h2>
                        <button onClick={() => setShowAddEvent(true)} className="neo-btn-primary text-xs flex items-center gap-1">
                            <Plus size={14} /> Add Event
                        </button>
                    </div>

                    {/* Add Event Modal */}
                    {showAddEvent && (
                        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                            <div className="neo-card w-full max-w-md">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold">Add Event</h2>
                                    <button onClick={() => { setShowAddEvent(false); reset(); }} className="p-1 hover:bg-gray-100">
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit((d) => createEventMutation.mutate(d))} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Title</label>
                                        <input {...register("title")} className="neo-input" placeholder="e.g. Department Meeting" />
                                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Description</label>
                                        <textarea {...register("description")} className="neo-textarea" placeholder="Optional details" rows={3} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Event Date</label>
                                        <input {...register("eventDate")} type="date" className="neo-input" />
                                        {errors.eventDate && <p className="text-xs text-red-500 mt-1">{errors.eventDate.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Reminder Date (optional)</label>
                                        <input {...register("reminderDate")} type="date" className="neo-input" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" className="neo-btn-primary flex-1" disabled={createEventMutation.isPending}>
                                            {createEventMutation.isPending ? "Adding..." : "Add Event"}
                                        </button>
                                        <button type="button" onClick={() => { setShowAddEvent(false); reset(); }} className="neo-btn-outline">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Upcoming</h3>
                            <div className="space-y-2">
                                {upcomingEvents.map((event: any) => (
                                    <div key={event.id} className="neo-card !p-3 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-amber-100 border-2 border-black flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold">
                                                {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                            <span className="text-lg font-black leading-none">
                                                {new Date(event.eventDate).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{event.title}</p>
                                            {event.description && (
                                                <p className="text-xs text-gray-500 truncate">{event.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteEventMutation.mutate(event.id)}
                                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Past</h3>
                            <div className="space-y-2">
                                {pastEvents.map((event: any) => (
                                    <div key={event.id} className="neo-card !p-3 !opacity-60 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-gray-400">
                                                {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                            <span className="text-lg font-black leading-none text-gray-400">
                                                {new Date(event.eventDate).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-gray-500">{event.title}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteEventMutation.mutate(event.id)}
                                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {events.length === 0 && (
                        <div className="neo-card !p-8 text-center">
                            <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">No events yet</p>
                            <p className="text-xs text-gray-400 mt-1">Add your personal schedule events</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
