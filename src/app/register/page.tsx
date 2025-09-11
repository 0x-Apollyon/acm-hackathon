"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AuthAPI } from "@/lib/authClient";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await AuthAPI.register({ username, email, password });
    setLoading(false);
    if (res.status === "success") {
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 800);
    } else {
      setError(res.error || "Registration failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm glass-strong border border-slate-500/40 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        {error && (
          <div className="mb-3 text-red-300 text-sm" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 text-green-300 text-sm" role="status">
            {success}
          </div>
        )}
        <label className="text-sm mb-1 block">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yourname"
          className="mb-3"
          required
        />
        <label className="text-sm mb-1 block">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-3"
          required
        />
        <label className="text-sm mb-1 block">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mb-4"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
        <p className="mt-3 text-sm text-white/80">
          Have an account? <Link className="underline" href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}


