"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";

import { loginSchema, type LoginViewValues } from "./schema";
import { login } from "@/requests/authAPI";
import { setAccessToken } from "@/requests/core/tokenStore";
import { useSnackbar } from "@/components/ui/snackbar";
import { useAuthActions } from "@/contexts/AuthContext";

export interface UseLoginViewResult {
  form: UseFormReturn<LoginViewValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const setRootError = (
  form: UseFormReturn<LoginViewValues>,
  message: string
) => {
  form.setError("root", { type: "server", message });
  return message;
};

const handleLoginError = (
  error: unknown,
  form: UseFormReturn<LoginViewValues>
): string => {
  if (!axios.isAxiosError(error)) {
    return setRootError(form, "予期せぬエラーが発生しました");
  }

  const data = error.response?.data as { message?: string } | undefined;
  const backendMessage = data?.message;

  if (!backendMessage) {
    return setRootError(form, "ログインに失敗しました");
  }

  // 1. 認証不整合
  if (backendMessage === "invalid credentials") {
    const msg = "メールアドレスまたはパスワードが正しくありません";
    form.setError("email", { type: "server" });
    form.setError("password", { type: "server", message: msg });
    return msg;
  }

  // 2. バリデーションエラー
  if (backendMessage.includes("LoginRequest.MailAddress")) {
    const msg = "メールアドレスの形式が正しくありません";
    form.setError("email", { type: "server", message: msg });
    return msg;
  }

  if (backendMessage.includes("LoginRequest.Password")) {
    const msg = "パスワードの形式が正しくありません";
    form.setError("password", { type: "server", message: msg });
    return msg;
  }

  // 3. その他
  const messageMap: Record<string, string> = {
    "invalid payload": "送信内容が不正です。入力内容を確認してください",
    "missing refresh cookie": "ログイン情報が見つかりません。再ログインしてください",
    "invalid refresh token": "セッションが無効です。再ログインしてください",
  };

  return setRootError(form, messageMap[backendMessage] || "ログインに失敗しました");
};

export function useLoginView(): UseLoginViewResult {
  const router = useRouter();
  const { fetchMe } = useAuthActions();
  const { showSnackbar } = useSnackbar();

  const form = useForm<LoginViewValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    // 前回エラーをクリア（root と field 両方）
    form.clearErrors();

    try {
      const res = await login({
        mailAddress: values.email,
        password: values.password,
      });

      await fetchMe();

      setAccessToken(res.accessToken, res.accessExpiresAt);
      showSnackbar("ログインしました", "success");
      router.push("/calenders");
    } catch (error) {
      const errorMessage = handleLoginError(error, form);
      showSnackbar(errorMessage, "error");
    }
  });

  return { form, onSubmit };
}
