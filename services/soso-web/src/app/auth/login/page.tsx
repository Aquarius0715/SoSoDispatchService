"use client";

import { AuthLayout } from "@/layouts/AuthLayout/AuthLayout";
import { LoginView } from "@/views/LoginView/LoginView";
import { useLoginView } from "@/views/LoginView/useLoginView";

export default function LoginPage() {
  const viewProps = useLoginView();

  return (
    <AuthLayout>
      <LoginView {...viewProps} />
    </AuthLayout>
  );
}