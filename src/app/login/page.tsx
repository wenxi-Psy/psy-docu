"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Reactively navigate when auth state changes (no race condition)
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(error.message); return; }
        setMessage("注册成功！请查看邮箱验证链接。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        // Navigation handled by useEffect above — waits for onAuthStateChange to set user
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-10">
          <span className="text-5xl">🌿</span>
          <h1 className="text-2xl font-bold text-on-surface mt-4 tracking-tight">宁静账本</h1>
          <p className="text-[11px] text-on-surface-variant mt-1 tracking-[0.15em] font-medium">DIGITAL SANCTUARY</p>
          <p className="text-sm text-on-surface-variant mt-3">独立执业咨询师的个案管理工具</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-[2rem] shadow-ambient p-8 space-y-5">
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="至少6位" minLength={6} className={inputClass} />
          </div>

          {error && <p className="text-xs text-error-container">{error}</p>}
          {message && <p className="text-xs text-primary">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-40 transition-colors shadow-ambient">
            {loading ? "请稍候..." : isSignUp ? "注册" : "登录"}
          </button>

          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            className="w-full text-center text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            {isSignUp ? "已有账号？登录" : "没有账号？注册"}
          </button>
        </form>
      </div>
    </div>
  );
}
