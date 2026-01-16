"use client";

import { AuthLayout } from "@/layouts/AuthLayout/AuthLayout";
import { useRegisterView } from "@/views/RegisterView/useRegisterView";
import { RegisterView } from "@/views/RegisterView/RegisterView";

export default function RegisterPage() {
  const viewProps = useRegisterView();

  return (
    <AuthLayout>
      <RegisterView {...viewProps} />
    </AuthLayout>
  );
}