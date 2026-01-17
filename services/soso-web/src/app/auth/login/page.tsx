"use client";

import { LoginView } from "@/views/LoginView/LoginView";
import { useLoginView } from "@/views/LoginView/useLoginView";

export default function LoginPage() {
  const viewProps = useLoginView();

  return <LoginView {...viewProps} />;
}