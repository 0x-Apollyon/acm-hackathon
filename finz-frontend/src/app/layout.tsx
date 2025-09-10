import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "FinZ - Financial Dashboard",
  description: "Financial dashboard for managing your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Header />
        <Suspense fallback={null}>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </Suspense>
        <Analytics />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
