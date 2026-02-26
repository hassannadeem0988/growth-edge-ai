import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/utils/AuthContext";
import "./globals.css";
import "./globals.css";

// Load Inter font from Google Fonts (optimized by Next.js)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GrowthEdge AI Assistant",
  description:
    "AI-powered internal business assistant for GrowthEdge Solutions. Chat with your company data, generate content, and automate replies.",
  keywords: ["AI assistant", "business", "GrowthEdge", "RAG", "document AI"],
  authors: [{ name: "GrowthEdge Solutions" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
