import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const RegisterButton: React.FC = () => {
  return (
    <div className="text-center mt-4">
      <p className="text-sm text-slate-600 mb-2">アカウントをお持ちでない方</p>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/register">新規会員登録はこちら</Link>
      </Button>
    </div>
  );
};