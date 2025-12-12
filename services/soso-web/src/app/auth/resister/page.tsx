"use client";

import { AuthLayout } from "@/layouts/AuthLayout/AuthLayout";
import { useRegisterView } from "@/views/ResisterView/useResisterView";
import { RegisterView } from "@/views/ResisterView/ResisterView";

export default function RegisterPage() {
  const viewProps = useRegisterView();

  return (
    <AuthLayout>
      <RegisterView {...viewProps} />
    </AuthLayout>
  );
}