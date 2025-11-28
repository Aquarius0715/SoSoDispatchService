// src/app/resister/page.tsx
"use client";

import { useRegisterForm } from "@/components/Resister/useResisterForm";
import { RegisterForm } from "@/components/Resister/ResisterForm";

export default function ResisterPage() {
  const registerForm = useRegisterForm();

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-800">
          SOSo
        </h1>
        <RegisterForm {...registerForm} />
      </div>
    </main>
  );
}
