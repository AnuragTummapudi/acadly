import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface User {
    id: string;
    fullName: string;
    email: string;
    role: "faculty" | "hod" | "dean" | "superadmin";
    points: number;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { fullName: string; email: string; password: string; role: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: () => api.get("/api/auth/me"),
        retry: false,
        staleTime: 60000,
    });

    const loginMutation = useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            api.post("/api/auth/login", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: { fullName: string; email: string; password: string; role: string }) =>
            api.post("/api/auth/register", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => api.post("/api/auth/logout"),
        onSuccess: () => {
            queryClient.clear();
        },
    });

    const login = useCallback(
        async (email: string, password: string) => {
            await loginMutation.mutateAsync({ email, password });
        },
        [loginMutation]
    );

    const register = useCallback(
        async (data: { fullName: string; email: string; password: string; role: string }) => {
            await registerMutation.mutateAsync(data);
        },
        [registerMutation]
    );

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    return (
        <AuthContext.Provider
            value={{
                user: user || null,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }
    return context;
}
