"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_logged_in") === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_logged_in", "true");
        router.replace("/dashboard");
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181114] font-sans">
      <div className="bg-gradient-to-br from-[#22161b] to-[#271b20] p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-[#39282e] animate-fadeIn">
        <h1 className="text-white text-2xl font-extrabold tracking-tight text-center pb-2 border-b border-[#39282e]">Store Admin Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-[#b16cea] text-sm font-semibold">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all placeholder:text-[#ba9ca7] text-base outline-none"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[#b16cea] text-sm font-semibold">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all placeholder:text-[#ba9ca7] text-base outline-none"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="text-red-400 text-center text-sm font-semibold">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white font-bold text-lg hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
