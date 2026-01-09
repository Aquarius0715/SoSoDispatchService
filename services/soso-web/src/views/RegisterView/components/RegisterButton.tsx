import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RegisterButtonProps {
  isSubmitting: boolean;
  className?: string;
}

export const RegisterButton: React.FC<RegisterButtonProps> = ({
  isSubmitting,
  className,
}) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn("mt-2 w-full", className)}
    >
      {isSubmitting ? "送信中..." : "会員登録"}
    </Button>
  );
};