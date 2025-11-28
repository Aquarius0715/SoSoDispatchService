// src/app/login/page.tsx
"use client";

import { LoginForm } from "@/components/Login/LoginForm";
import { useLoginForm } from "@/components/Login/useLoginForm";

export default function LoginPage() {
  const loginForm = useLoginForm();

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* 上部のタイトル */}
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-800">
          SOSo
        </h1>

        {/* ログインフォーム本体 */}
        <LoginForm {...loginForm} />
      </div>
    </main>
  );
}
