import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Toaster } from "@/components/ui/sonner";

import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinZ",
  description: "Financial dashboard for managing your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <Suspense fallback={null}>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </Suspense>
        <Footer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
