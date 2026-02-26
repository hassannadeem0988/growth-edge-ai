"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Setup global Axios defaults for cookies
axios.defaults.withCredentials = true;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
    _id: string;
    email: string;
    messageCount: number;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => void;
    logout: () => void;
    refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check login status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/auth/me`);
                setUser(data);
                setIsAuthenticated(true);
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refreshUsage = async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await axios.get(`${API_URL}/api/user/usage`);
            setUser((prev) => (prev ? { ...prev, messageCount: data.messageCount } : null));
        } catch (error) {
            console.error("Failed to refresh usage count:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUsage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
