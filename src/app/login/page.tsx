"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <h1 className="text-xl font-bold text-gray-900 mt-3">宁静账本</h1>
          <p className="text-sm text-gray-400 mt-1">独立执业咨询师的个案管理工具</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="至少6位" minLength={6}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {message && <p className="text-xs text-green-600">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-40">
            {loading ? "请稍候..." : isSignUp ? "注册" : "登录"}
          </button>

          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600">
            {isSignUp ? "已有账号？登录" : "没有账号？注册"}
          </button>
        </form>
      </div>
    </div>
  );
}
