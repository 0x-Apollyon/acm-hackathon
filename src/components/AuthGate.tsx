"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/authClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AuthAPI.profile().then((res) => {
      if (!cancelled) {
        const ok = res.status === "success" && !!res.user;
        setAuthenticated(ok);
        if (!ok && pathname !== "/login" && pathname !== "/register") {
          router.replace("/login");
        }
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!checked) return null;
  if (!authenticated && pathname !== "/login" && pathname !== "/register") return null;
  return <>{children}</>;
}


