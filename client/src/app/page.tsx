"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";
import ChatBox, { ChatBoxHandle } from "@/components/ChatBox";
import UsageTracker from "@/components/UsageTracker";

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatRef = useRef<ChatBoxHandle>(null);

  // Protect Route
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="w-10 h-10 border-4 border-[#D6EAF8] border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Fixed Layout Left Sidebar */}
      <aside className="w-64 bg-[#1C2331] text-white flex flex-col transition-all shadow-xl z-10 hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-primary mr-2 text-2xl">GE</span>
            GrowthEdge
          </h1>
          <p className="text-[#85C1E9] text-xs font-medium tracking-wider mt-1 uppercase">AI Assistant</p>
        </div>

        <nav className="flex-1 mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-primary rounded-lg text-white font-medium shadow-sm">
                <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Active Chat</span>
              </a>
            </li>
            {user?.role === "admin" && (
              <li>
                <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Admin View</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* User Profile & Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#151a25]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#2874A6] rounded-full flex items-center justify-center text-sm font-bold shadow-inner border border-[#5DADE2]">
              {user?.email ? user.email.substring(0, 2).toUpperCase() : ""}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-[#85C1E9] capitalize">{user?.role} Access</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-center text-[#5D6D7E] hover:text-white border border-[#5D6D7E] hover:border-gray-500 rounded-md transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#1C2331] text-white p-4 flex justify-between items-center shadow-md relative z-20">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">GrowthEdge AI</h1>
          </div>
          <button onClick={logout} className="text-sm bg-gray-800 px-3 py-1 rounded">Logout</button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 bg-[#1C2331] h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h1 className="text-xl font-bold flex items-center text-white">
                  <span className="text-primary mr-2 text-2xl">GE</span>
                  GrowthEdge
                </h1>
              </div>
              <nav className="mt-6">
                <ul className="space-y-2 px-4">
                  <li>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 bg-primary rounded-lg text-white font-medium shadow-sm">
                      <span>Active Chat</span>
                    </Link>
                  </li>
                  {user?.role === "admin" && (
                    <li>
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white font-medium transition-colors">
                        <span>Admin View</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">

          {/* Chat Container (Left Column) */}
          <section className="flex-1 flex flex-col h-[85vh] md:h-full">
            <ChatBox ref={chatRef} />
          </section>

          {/* Widgets Container (Right Column) */}
          <aside className="w-full md:w-80 flex flex-col space-y-6">
            <UsageTracker />

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#1C2331] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => chatRef.current?.triggerAction("draft-email")}
                  className="flex items-center justify-center space-x-2 bg-[#F4F6F8] hover:bg-[#EBF5FB] text-[#1A5276] p-3 rounded-lg border border-gray-200 transition-colors text-sm font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Draft Email</span>
                </button>
                <button
                  onClick={() => chatRef.current?.triggerAction("summarize")}
                  className="flex items-center justify-center space-x-2 bg-[#F4F6F8] hover:bg-[#EBF5FB] text-[#1A5276] p-3 rounded-lg border border-gray-200 transition-colors text-sm font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Summarize</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
