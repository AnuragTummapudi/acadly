import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import { UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["faculty", "hod", "dean", "superadmin"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuthContext();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: "faculty" },
    });

    const onSubmit = async (data: RegisterForm) => {
        setError("");
        setLoading(true);
        try {
            await registerUser(data);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Full-screen background image */}
            <img
                src="/srmap.jpg"
                alt="SRM AP Campus"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Registration card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black tracking-tight text-white">ACADLY</h1>
                    <p className="text-sm text-white/70 mt-1">Faculty Engagement Portal</p>
                    <p className="text-xs text-white/40 mt-0.5">SRM University, AP — Amaravati</p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm border-2 border-black shadow-neo p-8">
                    <h2 className="text-xl font-bold mb-5">Create Account</h2>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 px-4 py-3 mb-4 text-sm text-red-700">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                            <input
                                {...register("fullName")}
                                className="neo-input"
                                placeholder="Dr. John Smith"
                                autoFocus
                                autoComplete="name"
                            />
                            {errors.fullName && (
                                <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="neo-input"
                                placeholder="you@srmap.edu.in"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    className="neo-input !pr-10"
                                    placeholder="Min 6 characters"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Role</label>
                            <select {...register("role")} className="neo-select">
                                <option value="faculty">Faculty</option>
                                <option value="hod">HOD</option>
                                <option value="dean">Dean</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="neo-btn-primary w-full flex items-center justify-center gap-2 !py-3" disabled={loading}>
                            <UserPlus size={16} />
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-black underline underline-offset-2">
                            Sign In
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-white/30 mt-6">
                    © 2026 SRM University AP. All rights reserved.
                </p>
            </div>
        </div>
    );
}
