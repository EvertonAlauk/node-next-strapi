import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every page depends on the logged-in user (the navbar reads the session), so the routes are
// not prerendered. Pages block on the server while they load their data.
export const instant = false;

export const metadata: Metadata = {
  title: "Posts",
  description: "Post list",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Reads the session, so it sits behind a Suspense boundary (required by cacheComponents) */}
        <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
