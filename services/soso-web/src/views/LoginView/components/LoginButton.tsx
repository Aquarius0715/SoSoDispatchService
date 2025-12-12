import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  isSubmitting: boolean;
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isSubmitting,
  className,
}) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn("w-full", className)}
    >
      {isSubmitting ? "ログイン中..." : "ログイン"}
    </Button>
  );
};