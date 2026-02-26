"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";
import axios from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
                { email, password }
            );

            login(data);
            router.push("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to log in. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#1C2331]">GrowthEdge AI</h1>
                    <p className="text-[#5D6D7E] mt-2 text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#1C2331] mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="sarah@growthedge.co"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1C2331] mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-2.5 mt-2 flex justify-center items-center"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
