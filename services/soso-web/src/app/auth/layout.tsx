// app/auth/layout.tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-800">
          SOSo
        </h1>

        {children}
      </div>
    </main>
  );
}
