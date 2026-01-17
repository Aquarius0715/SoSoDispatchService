"use client";

import { useRegisterView } from "@/views/RegisterView/useRegisterView";
import { RegisterView } from "@/views/RegisterView/RegisterView";

export default function RegisterPage() {
  const viewProps = useRegisterView();

  return <RegisterView {...viewProps} />;
}