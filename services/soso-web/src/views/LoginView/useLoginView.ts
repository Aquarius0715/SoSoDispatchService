// src/components/Login/useLoginView.ts
"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";

import { loginSchema, type LoginViewValues } from "./schema";
import { login, type LoginResult } from "@/requests/authAPI";
import { setAccessToken } from "@/requests/core/tokenStore";
import { useSnackbar } from "@/components/ui/snackbar";

export interface UseLoginViewResult {
  form: ReturnType<typeof useForm<LoginViewValues>>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: LoginResult | null;
}

// =======================================
// バックエンドの英語エラーメッセージ → 日本語に変換
// =======================================
function mapLoginErrorMessage(backendMessage?: string): string {
  if (!backendMessage) {
    return "ログインに失敗しました";
  }

  // ---- AuthHandler で明示的に返しているメッセージ ----
  if (backendMessage === "invalid credentials") {
    return "メールアドレスまたはパスワードが正しくありません";
  }

  if (backendMessage === "invalid payload") {
    return "送信内容が不正です。入力内容を確認してください";
  }

  if (backendMessage === "missing refresh cookie") {
    return "ログイン情報が見つかりません。もう一度ログインしてください";
  }

  if (backendMessage === "invalid refresh token") {
    return "ログイン情報が無効になりました。もう一度ログインしてください";
  }

  // ---- go-playground/validator のメッセージをざっくりマッピング ----
  // 例) Key: 'LoginRequest.MailAddress' Error:Field validation for 'MailAddress' failed on the 'required' tag
  if (backendMessage.includes("LoginRequest.MailAddress")) {
    return "メールアドレスの形式が正しくありません";
  }

  if (backendMessage.includes("LoginRequest.Password")) {
    return "パスワードの形式が正しくありません";
  }

  // それ以外は一旦そのまま or 汎用メッセージ
  return backendMessage || "ログインに失敗しました";
}

// =======================================
// メインフック
// =======================================
export function useLoginView(): UseLoginViewResult {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<LoginResult | null>(null);

  const form = useForm<LoginViewValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    setResult(null);

    try {
      // ---- ログイン API 呼び出し ----
      const res = await login({
        mailAddress: values.email,
        password: values.password,
      });

      setResult(res);

      // ---- AccessToken をメモリに保存（tokenStore）----
      setAccessToken(res.accessToken, res.accessExpiresAt);

      // 成功時のスナックバー（出したければ）
      // showSnackbar("ログインしました。", "success");

      // ログインしたのでカレンダー一覧へ
      router.push("/calenderList");
    } catch (error: unknown) {
      let message = "ログインに失敗しました";
      let handledByFieldError = false;

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        const backendMessage: string | undefined =
          typeof data?.message === "string" ? data.message : undefined;

        const localized = mapLoginErrorMessage(backendMessage);
        message = localized;

        // ---- フィールド用エラー（フォーム下ではなく各入力欄の下に出す）----

        // 認証失敗 → パスワード欄に出す（メール欄とまとめてもOK）
        if (backendMessage === "invalid credentials") {
          form.setError("password", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        }
        // バリデーション系（メールアドレス）
        else if (backendMessage?.includes("LoginRequest.MailAddress")) {
          form.setError("email", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        }
        // バリデーション系（パスワード）
        else if (backendMessage?.includes("LoginRequest.Password")) {
          form.setError("password", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        }
      }

      // フィールドに乗せられなかったエラーだけフォーム下に表示
      if (!handledByFieldError) {
        setApiError(message);
      }

      // どちらにせよスナックバーには出す
      showSnackbar(message, "error");
    }
  });

  return {
    form,
    onSubmit,
    apiError,
    result,
  };
}
