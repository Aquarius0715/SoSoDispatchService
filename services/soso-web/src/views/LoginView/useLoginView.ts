"use client";

import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";

import { loginSchema, type LoginViewValues } from "./schema";
import { login, type LoginResult } from "@/requests/authAPI";
import { setAccessToken } from "@/requests/core/tokenStore";
import { useSnackbar } from "@/components/ui/snackbar";

// --- Types ---
export interface UseLoginViewResult {
  form: UseFormReturn<LoginViewValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
}

// --- Helper: エラーハンドリングロジックの分離 ---
// バックエンドのエラーを解析し、フォームエラー設定またはグローバルエラーメッセージを返す
const handleLoginError = (
  error: unknown,
  form: UseFormReturn<LoginViewValues>
): string => {
  if (!axios.isAxiosError(error)) {
    return "予期せぬエラーが発生しました";
  }

  const data = error.response?.data as { message?: string } | undefined;
  const backendMessage = data?.message;

  if (!backendMessage) return "ログインに失敗しました";

  // 1. パスワード/認証不整合
  if (backendMessage === "invalid credentials") {
    const msg = "メールアドレスまたはパスワードが正しくありません";
    form.setError("password", { type: "server", message: msg });
    return msg; // スナックバー用にも返す
  }

  // 2. バリデーションエラー (Go Playground Validator pattern)
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

  // 3. その他サーバーエラーメッセージの翻訳
  const messageMap: Record<string, string> = {
    "invalid payload": "送信内容が不正です。入力内容を確認してください",
    "missing refresh cookie": "ログイン情報が見つかりません。再ログインしてください",
    "invalid refresh token": "セッションが無効です。再ログインしてください",
  };

  return messageMap[backendMessage] || "ログインに失敗しました";
};

// --- Main Hook ---
export function useLoginView(): UseLoginViewResult {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginViewValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);

    try {
      const res = await login({
        mailAddress: values.email,
        password: values.password,
      });

      // 成功処理
      setAccessToken(res.accessToken, res.accessExpiresAt);
      showSnackbar("ログインしました", "success");
      router.push("/calenders");

    } catch (error) {
      // 失敗処理（詳細はヘルパーに委譲）
      const errorMessage = handleLoginError(error, form);
      
      // フォームエラー(setError)されなかった場合のみ、コンポーネント用のAPIエラー状態を更新
      // ※ここでは簡易的に「全ての失敗時にスナックバーを出す」方針としています
      setApiError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  });

  return { form, onSubmit, apiError };
}