"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import { useAuth } from "@/utils/AuthContext";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    sources?: string[];
}

export interface ChatBoxHandle {
    triggerAction: (action: "summarize" | "draft-email") => void;
}

const ChatBox = forwardRef<ChatBoxHandle, {}>((props, ref) => {
    const { user, refreshUsage } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [errorLine, setErrorLine] = useState("");

    const bottomRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        triggerAction: (action) => {
            if (isTyping || !user) return;

            let prompt = "";
            if (action === "summarize") {
                prompt = "Please provide a concise executive summary of our conversation so far.";
            } else if (action === "draft-email") {
                prompt = "Draft a professional business email based on the key points we discussed.";
            }

            if (prompt) {
                processMessage(prompt);
            }
        }
    }));

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const processMessage = async (userMessage: string) => {
        setErrorLine("");
        setIsTyping(true);

        // Optimistically add message
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/chat`,
                { message: userMessage }
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.reply,
                    sources: data.sources,
                },
            ]);

            // Update global context usage
            await refreshUsage();

        } catch (err: any) {
            if (err.response?.status === 403) {
                setErrorLine(err.response.data.message);
                refreshUsage();
            } else {
                setErrorLine("Failed to retrieve a response. Ensure backend is running.");
            }
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsTyping(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || isTyping) return;

        const userMessage = input.trim();
        setInput("");
        await processMessage(userMessage);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#F4F6F8] px-6 py-4 flex items-center border-b border-gray-200">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                    GE
                </div>
                <div>
                    <h2 className="font-semibold text-[#1C2331]">GrowthEdge Business Assistant</h2>
                    <p className="text-xs text-[#5D6D7E]">Connected to Knowledge Base</p>
                </div>
            </div>

            {/* Error Logic Box */}
            {errorLine && (
                <div className="p-3 m-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 font-medium">
                    {errorLine}
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#5D6D7E] text-center space-y-4">
                        <div className="p-4 bg-[#F4F6F8] rounded-full">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="max-w-xs">Ask me anything about GrowthEdge Solutions, company policies, or the knowledge base.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-5 py-4 ${msg.role === "user"
                                    ? "bg-[#EBF5FB] text-[#1C2331] rounded-tr-none border border-[#D6EAF8]" // GrowthEdge Blue 50
                                    : "bg-[#F4F6F8] text-[#1C2331] rounded-tl-none border border-gray-200"
                                    }`}
                            >
                                <div className="prose prose-sm max-w-none text-[#1C2331] leading-relaxed">
                                    <ReactMarkdown components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                        strong: ({ children }) => <strong className="font-bold text-[#154360]">{children}</strong>
                                    }}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Citations / RAG Logic mapping */}
                                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-300 flex flex-wrap gap-2 text-xs font-medium text-[#5D6D7E]">
                                        {msg.sources.map((source, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-[11px] shadow-sm">
                                                <svg className="w-3 h-3 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Source: {source}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Phase 3 Semantic Loading UI */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-[#F4F6F8] border border-gray-200 rounded-2xl rounded-tl-none px-5 py-4 text-[#5D6D7E] text-sm flex items-center space-x-3">
                            <div className="flex space-x-1.5 p-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            </div>
                            <span className="animate-pulse">Searching knowledge base...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="relative flex items-center group">
                    <input
                        type="text"
                        className="w-full bg-[#F4F6F8] text-[#1C2331] rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner border border-transparent focus:border-primary"
                        placeholder="Type your question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
});

export default ChatBox;
