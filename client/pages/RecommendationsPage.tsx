import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../lib/api";
import { useAuthContext } from "../providers/AuthProvider";
import {
    Star,
    Plus,
    MessageSquare,
    ThumbsUp,
    X,
    Send,
    MapPin,
    Tag,
} from "lucide-react";

const recSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    category: z.string().min(1, "Select a category"),
    rating: z.number().min(1).max(5),
    location: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type RecForm = z.infer<typeof recSchema>;

const categories = [
    "Teaching",
    "Research",
    "Conference",
    "Book",
    "Tool",
    "Course",
    "Workshop",
    "Resource",
    "Restaurant",
    "School",
    "Healthcare",
    "Housing",
    "Recreation",
    "Shopping",
    "Service",
    "Other",
];

export default function RecommendationsPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedRec, setSelectedRec] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");

    const { data: recs = [], isLoading } = useQuery({
        queryKey: ["recommendations"],
        queryFn: () => api.get("/api/recommendations"),
    });

    const { data: detail } = useQuery({
        queryKey: ["recommendation", selectedRec],
        queryFn: () => api.get(`/api/recommendations/${selectedRec}`),
        enabled: !!selectedRec,
    });

    const createMutation = useMutation({
        mutationFn: (data: RecForm) => api.post("/api/recommendations", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setShowCreate(false);
            reset();
        },
    });

    const upvoteMutation = useMutation({
        mutationFn: (id: string) => api.post(`/api/recommendations/${id}/upvote`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            if (selectedRec) queryClient.invalidateQueries({ queryKey: ["recommendation", selectedRec] });
        },
    });

    const commentMutation = useMutation({
        mutationFn: (data: { id: string; content: string }) =>
            api.post(`/api/recommendations/${data.id}/comments`, { content: data.content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recommendation", selectedRec] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setCommentText("");
        },
    });

    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<RecForm>({
        resolver: zodResolver(recSchema),
        defaultValues: { rating: 5 },
    });

    const currentRating = watch("rating");

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-6">
                <h1 className="page-title !mb-0">Recommendations</h1>
                <button onClick={() => setShowCreate(true)} className="neo-btn-primary flex items-center gap-2">
                    <Plus size={16} /> New
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="neo-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">New Recommendation</h2>
                            <button onClick={() => { setShowCreate(false); reset(); }} className="p-1 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Title</label>
                                <input {...register("title")} className="neo-input" placeholder="e.g. Flutter Development Workshop" />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Category</label>
                                <select {...register("category")} className="neo-select">
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setValue("rating", n)}
                                            className={`w-8 h-8 border-2 border-black flex items-center justify-center transition-colors ${n <= (currentRating || 0) ? "bg-amber-400" : "bg-white"
                                                }`}
                                        >
                                            <Star size={14} fill={n <= (currentRating || 0) ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Location (optional)</label>
                                <input {...register("location")} className="neo-input" placeholder="e.g. Room 302, Engineering Block" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Description</label>
                                <textarea {...register("description")} className="neo-textarea" placeholder="Share your recommendation details..." rows={4} />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="neo-btn-primary flex-1" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create (+5 pts)"}
                                </button>
                                <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="neo-btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRec && detail && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="neo-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{detail.title}</h2>
                            <button onClick={() => setSelectedRec(null)} className="p-1 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="neo-badge-blue">{detail.category}</span>
                                {detail.location && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin size={12} /> {detail.location}
                                    </span>
                                )}
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < detail.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description}</p>
                            <p className="text-xs text-gray-400">by {detail.authorName} · {new Date(detail.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                            <button
                                onClick={() => upvoteMutation.mutate(detail.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border-2 border-black transition-colors ${detail.hasUpvoted ? "bg-amber-400" : "bg-white hover:bg-gray-50"
                                    }`}
                            >
                                <ThumbsUp size={14} /> {detail.upvoteCount}
                            </button>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <MessageSquare size={14} /> {detail.comments?.length || 0} comments
                            </span>
                        </div>

                        {/* Comments */}
                        <div className="space-y-3 mb-4">
                            {detail.comments?.map((c: any) => (
                                <div key={c.id} className="bg-gray-50 p-3 border border-gray-200">
                                    <p className="text-sm">{c.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">{c.authorName} · {new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="neo-input flex-1"
                                placeholder="Add a comment... (+3 pts)"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && commentText.trim()) {
                                        commentMutation.mutate({ id: detail.id, content: commentText });
                                    }
                                }}
                            />
                            <button
                                onClick={() => commentText.trim() && commentMutation.mutate({ id: detail.id, content: commentText })}
                                className="neo-btn-primary px-3"
                                disabled={!commentText.trim() || commentMutation.isPending}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            ) : recs.length === 0 ? (
                <div className="neo-card !p-12 text-center">
                    <Star size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No recommendations yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to share one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recs.map((rec: any) => (
                        <div
                            key={rec.id}
                            className="neo-card cursor-pointer"
                            onClick={() => setSelectedRec(rec.id)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-sm line-clamp-1">{rec.title}</h3>
                                <span className="neo-badge-blue text-xs ml-2 flex-shrink-0">{rec.category}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{rec.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp size={12} /> {rec.upvoteCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare size={12} /> {rec.commentCount}
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < rec.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{rec.authorName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
