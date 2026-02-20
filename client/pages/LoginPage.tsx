import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuthContext();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setError("");
        setLoading(true);
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left side — Campus Image (70%) */}
            <div className="relative w-full lg:w-[70%] h-48 sm:h-64 lg:h-screen flex-shrink-0">
                <img
                    src="/srmap.jpg"
                    alt="SRM AP Campus"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                {/* Branding on image */}
                <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12 text-white z-10">
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-none">ACADLY</h1>
                    <p className="text-sm lg:text-lg text-white/80 mt-1 lg:mt-2 font-medium">Faculty Engagement Portal</p>
                    <p className="text-xs lg:text-sm text-white/50 mt-0.5 hidden sm:block">SRM University, AP — Amaravati</p>
                </div>
            </div>

            {/* Right side — Sign In Form (30%) */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[#fafafa]">
                <div className="w-full max-w-sm">
                    {/* Mobile-only logo (hidden on lg since image has branding) */}
                    <div className="text-center mb-6 lg:hidden">
                        <h1 className="text-2xl font-black tracking-tight">ACADLY</h1>
                    </div>

                    <div className="lg:mb-8">
                        <h2 className="text-2xl font-bold">Welcome back</h2>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 px-4 py-3 mb-4 mt-4 text-sm text-red-700">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="neo-input"
                                placeholder="you@srmap.edu.in"
                                autoFocus
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
                                    placeholder="••••••••"
                                    autoComplete="current-password"
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

                        <button type="submit" className="neo-btn-primary w-full flex items-center justify-center gap-2 !py-3" disabled={loading}>
                            <LogIn size={16} />
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold text-black underline underline-offset-2">
                            Register
                        </Link>
                    </p>

                    <p className="text-center text-xs text-gray-300 mt-8 hidden lg:block">
                        © 2026 SRM University AP. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
