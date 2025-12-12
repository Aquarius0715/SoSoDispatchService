import React from "react";
import { Button } from "@/components/ui/button";

export interface RegisterButtonProps {
  isSubmitting: boolean;
}

export const RegisterButton: React.FC<RegisterButtonProps> = ({ isSubmitting }) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="mt-2 w-full"
    >
      {isSubmitting ? "送信中..." : "会員登録"}
    </Button>
  );
};