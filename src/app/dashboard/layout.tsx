"use client";

import type React from "react";
import AuthGate from "@/components/AuthGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}


