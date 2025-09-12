"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AuthAPI } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await AuthAPI.login({ username, password });
    setLoading(false);
    if (res.status === "success") {
      router.replace("/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm glass-strong border border-slate-500/40 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        {error && (
          <div className="mb-3 text-red-300 text-sm" role="alert">
            {error}
          </div>
        )}
        <label className="text-sm mb-1 block">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="UserName kek :)"
          className="mb-3"
          required
        />
        <label className="text-sm mb-1 block">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password plsss ;)"
          className="mb-4"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="mt-3 text-sm text-white/80">
          No account? <Link className="underline" href="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}


