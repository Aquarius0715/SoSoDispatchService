import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const RegisterButton: React.FC = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      asChild
    >
      <Link href="/auth/resister">新規登録</Link>
    </Button>
  );
};