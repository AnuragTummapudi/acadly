import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuthContext } from "../providers/AuthProvider";
import {
    HelpCircle,
    Plus,
    X,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

const querySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    type: z.string().min(1, "Select a type"),
});

type QueryForm = z.infer<typeof querySchema>;

const responseSchema = z.object({
    response: z.string().min(1, "Response is required"),
    status: z.enum(["open", "in_progress", "resolved"]),
});

type ResponseForm = z.infer<typeof responseSchema>;

const queryTypes = [
    "Academic",
    "Administrative",
    "Infrastructure",
    "IT Support",
    "Policy",
    "Research",
    "Other",
];

const statusConfig: Record<string, { icon: React.ReactNode; badge: string; label: string }> = {
    open: { icon: <AlertCircle size={14} />, badge: "neo-badge-amber", label: "Open" },
    in_progress: { icon: <Clock size={14} />, badge: "neo-badge-blue", label: "In Progress" },
    resolved: { icon: <CheckCircle size={14} />, badge: "neo-badge-green", label: "Resolved" },
};

export default function QueriesPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState<any | null>(null);
    const [showRespond, setShowRespond] = useState(false);

    const canRespond = user && ["hod", "dean", "superadmin"].includes(user.role);

    const { data: queriesList = [], isLoading } = useQuery({
        queryKey: ["queries"],
        queryFn: () => api.get("/api/queries"),
    });

    const createMutation = useMutation({
        mutationFn: (data: QueryForm) => api.post("/api/queries", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queries"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setShowCreate(false);
            createReset();
        },
    });

    const respondMutation = useMutation({
        mutationFn: (data: ResponseForm & { id: string }) =>
            api.patch(`/api/queries/${data.id}/respond`, {
                response: data.response,
                status: data.status,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queries"] });
            setShowRespond(false);
            setSelectedQuery(null);
            respondReset();
        },
    });

    const {
        register: createRegister,
        handleSubmit: createHandleSubmit,
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<QueryForm>({ resolver: zodResolver(querySchema) });

    const {
        register: respondRegister,
        handleSubmit: respondHandleSubmit,
        reset: respondReset,
        formState: { errors: respondErrors },
    } = useForm<ResponseForm>({
        resolver: zodResolver(responseSchema),
        defaultValues: { status: "in_progress" },
    });

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-6">
                <h1 className="page-title !mb-0">Queries & Feedback</h1>
                <button onClick={() => setShowCreate(true)} className="neo-btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Query
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="neo-card w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Submit Query</h2>
                            <button onClick={() => { setShowCreate(false); createReset(); }} className="p-1 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={createHandleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Title</label>
                                <input {...createRegister("title")} className="neo-input" placeholder="Brief summary of your query" />
                                {createErrors.title && <p className="text-xs text-red-500 mt-1">{createErrors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Type</label>
                                <select {...createRegister("type")} className="neo-select">
                                    <option value="">Select type</option>
                                    {queryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {createErrors.type && <p className="text-xs text-red-500 mt-1">{createErrors.type.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Description</label>
                                <textarea {...createRegister("description")} className="neo-textarea" placeholder="Describe your query in detail..." rows={4} />
                                {createErrors.description && <p className="text-xs text-red-500 mt-1">{createErrors.description.message}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="neo-btn-primary flex-1" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Submitting..." : "Submit Query (+3 pts)"}
                                </button>
                                <button type="button" onClick={() => { setShowCreate(false); createReset(); }} className="neo-btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Respond Modal */}
            {showRespond && selectedQuery && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="neo-card w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Respond to Query</h2>
                            <button onClick={() => { setShowRespond(false); respondReset(); }} className="p-1 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-gray-50 p-3 mb-4 border border-gray-200">
                            <p className="text-sm font-semibold">{selectedQuery.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedQuery.description}</p>
                        </div>
                        <form
                            onSubmit={respondHandleSubmit((data) =>
                                respondMutation.mutate({ ...data, id: selectedQuery.id })
                            )}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Status</label>
                                <select {...respondRegister("status")} className="neo-select">
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="open">Open</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Response</label>
                                <textarea {...respondRegister("response")} className="neo-textarea" placeholder="Your response..." rows={4} />
                                {respondErrors.response && <p className="text-xs text-red-500 mt-1">{respondErrors.response.message}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="neo-btn-primary flex-1" disabled={respondMutation.isPending}>
                                    {respondMutation.isPending ? "Sending..." : "Send Response"}
                                </button>
                                <button type="button" onClick={() => { setShowRespond(false); respondReset(); }} className="neo-btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Queries List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded animate-pulse" />)}
                </div>
            ) : queriesList.length === 0 ? (
                <div className="neo-card !p-12 text-center">
                    <HelpCircle size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No queries yet</p>
                    <p className="text-sm text-gray-400 mt-1">Submit your first query to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {queriesList.map((q: any) => {
                        const status = statusConfig[q.status] || statusConfig.open;
                        return (
                            <div key={q.id} className="neo-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-sm">{q.title}</h3>
                                            <span className={`${status.badge} text-xs flex items-center gap-1`}>
                                                {status.icon} {status.label}
                                            </span>
                                            <span className="neo-badge-gray text-xs">{q.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{q.description}</p>
                                        {q.response && (
                                            <div className="mt-3 bg-emerald-50 border border-emerald-200 p-3">
                                                <p className="text-xs font-semibold text-emerald-700 mb-1">Response:</p>
                                                <p className="text-sm text-emerald-800">{q.response}</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">by {q.authorName} · {new Date(q.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {canRespond && q.status !== "resolved" && (
                                        <button
                                            onClick={() => { setSelectedQuery(q); setShowRespond(true); }}
                                            className="neo-btn-outline text-xs flex items-center gap-1 flex-shrink-0"
                                        >
                                            <MessageSquare size={12} /> Respond
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
