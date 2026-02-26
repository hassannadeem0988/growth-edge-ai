"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";
import axios from "axios";
import Link from "next/link";

interface UserData {
    _id: string;
    email: string;
    messageCount: number;
    role: string;
}

interface DocumentData {
    _id: string;
    filename: string;
    size: number;
    chunks: number;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<UserData[]>([]);
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [resetting, setResetting] = useState(false);

    // Knowledge Management States
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== "admin") {
                router.push("/");
            } else {
                fetchData();
            }
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        try {
            const [usersRes, docsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/users`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/documents`)
            ]);
            setUsers(usersRes.data);
            setDocuments(docsRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data");
        } finally {
            setLoadingData(false);
        }
    };

    const resetAllUsage = async () => {
        if (!confirm("Are you sure you want to reset all limits?")) return;
        setResetting(true);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/reset-all`
            );
            await fetchData();
            alert("All user limits reset.");
        } catch (error) {
            console.error("Failed to reset limits");
            alert("Failed to reset limits.");
        } finally {
            setResetting(false);
        }
    };

    // --- Dynamic Knowledge Handling --- //

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processUpload(e.target.files[0]);
        }
    };

    const processUpload = async (file: File) => {
        if (!file.name.endsWith(".pdf")) {
            alert("Only PDF files are supported for Knowledge Base injection.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/upload`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            await fetchData(); // Refresh documents
            alert(`Successfully processed and indexed ${file.name}`);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to process document. See console.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isLoading || loadingData || !user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="w-10 h-10 border-4 border-[#D6EAF8] border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F6F8] flex flex-col p-6 md:p-10">
            <div className="max-w-5xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <Link href="/" className="text-primary hover:text-[#1A5276] transition-colors flex items-center text-sm font-semibold">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Assistant
                        </Link>
                        <h1 className="text-2xl font-bold text-[#1C2331] border-l border-gray-300 pl-4">Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={resetAllUsage}
                        disabled={resetting}
                        className="btn-primary py-2 px-6 flex items-center shadow-sm disabled:bg-gray-400"
                    >
                        {resetting ? "Resetting..." : "Reset Monthly Limits"}
                    </button>
                </div>

                {/* Dynamic Knowledge Management Block */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 md:p-8">
                    <h2 className="text-xl font-bold text-[#1C2331] mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-[#2E86C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Knowledge Management
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Upload Zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                 ${dragActive ? "border-[#2E86C1] bg-[#EBF5FB]" : "border-gray-300 bg-[#F8F9FA] hover:bg-gray-50"}
                 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleChange}
                            />
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-200 text-[#2E86C1]">
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#2E86C1] rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                )}
                            </div>
                            <p className="font-semibold text-[#1C2331]">
                                {uploading ? "Vectorizing & Syncing to AI Model..." : "Drag & Drop PDF here"}
                            </p>
                            <p className="text-sm text-[#5D6D7E] mt-2">
                                {uploading ? "This may take a minute" : "or click to upload. Max 20MB."}
                            </p>
                        </div>

                        {/* Uploaded Documents Log */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64">
                            <div className="bg-[#F8F9FA] px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-[#1C2331] text-sm">Indexed Documents Database</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto w-full">
                                {documents.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-[#5D6D7E]">
                                        No knowledge documents injected yet.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {documents.map((doc) => (
                                            <li key={doc._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium text-sm text-[#1C2331] truncate max-w-[200px]">{doc.filename}</p>
                                                        <p className="text-xs text-[#5D6D7E] mt-0.5">
                                                            {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="bg-[#EBF5FB] text-[#2E86C1] text-xs font-bold px-2 py-1 rounded-md">
                                                    {doc.chunks} Chunks
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] text-[#1C2331] border-b border-gray-200">
                                <th className="py-4 px-6 font-semibold">Email</th>
                                <th className="py-4 px-6 font-semibold text-center">Usage Count</th>
                                <th className="py-4 px-6 font-semibold text-center">Status</th>
                                <th className="py-4 px-6 font-semibold text-center">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const messageLimit = 500;
                                const hitLimit = u.messageCount >= messageLimit;
                                return (
                                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-[#1A5276] font-medium">{u.email}</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`font-bold ${hitLimit ? "text-red-500" : "text-[#5D6D7E]"}`}>
                                                {u.messageCount}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-1">/ {messageLimit}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${hitLimit
                                                        ? "bg-red-100 text-red-600 border border-red-200"
                                                        : "bg-green-100 text-green-700 border border-green-200"
                                                    }`}
                                            >
                                                {hitLimit ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-sm capitalize text-[#5D6D7E]">
                                            {u.role}
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
