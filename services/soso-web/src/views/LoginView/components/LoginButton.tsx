import React from "react";
import { Button } from "@/components/ui/button";

export interface LoginButtonProps {
  isSubmitting: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ isSubmitting }) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="mt-2 w-full"
    >
      {isSubmitting ? "送信中..." : "ログイン"}
    </Button>
  );
};