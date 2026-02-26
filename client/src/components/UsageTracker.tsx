"use client";

import React from "react";
import { useAuth } from "@/utils/AuthContext";

export default function UsageTracker() {
    const { user } = useAuth();

    if (!user) return null;

    const maxMessages = 500;
    const currentCount = user.messageCount || 0;
    const percentage = Math.min((currentCount / maxMessages) * 100, 100);

    // Pro-Tip: Switch to warning orange if hitting the 450 "danger zone"
    const isDangerZone = currentCount >= 450;
    const barColor = isDangerZone ? "bg-[#F39C12]" : "bg-primary";
    const textColor = isDangerZone ? "text-[#D68910]" : "text-primary";

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[#1C2331] flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#85C1E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Usage Tracker
                </h3>
                <span className={`text-sm font-bold ${textColor}`}>
                    {currentCount}/{maxMessages}
                </span>
            </div>

            <div className="w-full bg-[#EBF5FB] rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                <div
                    className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="flex justify-between mt-1 text-xs text-[#5D6D7E] font-medium">
                <span>0</span>
                <span className={isDangerZone ? "text-red-500 font-bold" : ""}>
                    {isDangerZone ? "Approaching Limit" : "messages used"}
                </span>
                <span>500</span>
            </div>
        </div>
    );
}
