// src/layouts/AuthLayout/AuthLayout.tsx
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-800">
          SOSo
        </h1>

        {children}
      </div>
    </main>
  );
}

export default AuthLayout;