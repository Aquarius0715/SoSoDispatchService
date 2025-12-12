// src/components/Resister/useRegisterView.ts
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";

import { registerSchema, type RegisterViewValues } from "./schema";
import {
  registerUser,
  type User,
} from "@/requests/userAPI";

// スナックバー
import { useSnackbar } from "@/components/ui/snackbar";

export interface UseRegisterViewResult {
  form: ReturnType<typeof useForm<RegisterViewValues>>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: User | null;
}

// ★ バックエンドの英語エラーメッセージ → 日本語メッセージ変換
function mapRegisterErrorMessage(backendMessage?: string): string {
  if (!backendMessage) {
    return "登録に失敗しました";
  }

  // --- 明示的に返しているメッセージたち ---
  if (backendMessage === "username already exists") {
    return "このユーザー名はすでに登録されています";
  }

  if (backendMessage === "mailAddress already exists") {
    return "このメールアドレスはすでに登録されています";
  }

  if (backendMessage === "capacity required when has_car is true") {
    return "車を持っている場合は、最大乗車人数を1以上で入力してください";
  }

  if (backendMessage === "invalid payload") {
    return "送信内容が不正です。入力内容を確認してください";
  }

  // --- go-playground/validator のメッセージをざっくり拾う ---
  // 例: Key: 'RegisterRequest.Username' Error:Field validation for 'Username' failed on the 'username' tag
  if (backendMessage.includes("RegisterRequest.Username")) {
    return "ユーザー名の形式が正しくありません";
  }

  if (backendMessage.includes("RegisterRequest.MailAddress")) {
    return "メールアドレスの形式が正しくありません";
  }

  if (backendMessage.includes("RegisterRequest.Password")) {
    return "パスワードの形式が正しくありません";
  }

  if (backendMessage.includes("RegisterRequest.Capacity")) {
    return "最大乗車人数の値が不正です";
  }

  // それ以外は一旦そのまま返す（必要に応じて増やしていく）
  return backendMessage || "登録に失敗しました";
}

export function useRegisterView(): UseRegisterViewResult {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<User | null>(null);

  const form = useForm<RegisterViewValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      username: "",
      hasCar: false,
      maxPassengers: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    setResult(null);

    try {
      const capacity =
        values.hasCar && values.maxPassengers
          ? Number(values.maxPassengers)
          : 0;

      const user = await registerUser({
        username: values.username,
        mailAddress: values.email,
        password: values.password,
        hasCar: values.hasCar,
        capacity,
      });

      setResult(user);

      // ✅ 成功スナックバー（/login に遷移しても右上に出る）
      showSnackbar("登録が完了しました。ログインしてください。", "success");

      // 登録完了後はログイン画面へ
      router.push("/login");
    } catch (error: unknown) {
      let message = "登録に失敗しました";
      let handledByFieldError = false; // ← フィールドごとのエラーに落とし込んだかどうか

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        const backendMessage: string | undefined =
          typeof data?.message === "string" ? data.message : undefined;

        const localized = mapRegisterErrorMessage(backendMessage);
        message = localized;

        // --- バックエンドのメッセージごとにフィールドに紐付ける ---
        if (
          backendMessage === "username already exists" ||
          backendMessage?.includes("RegisterRequest.Username")
        ) {
          form.setError("username", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        } else if (
          backendMessage === "mailAddress already exists" ||
          backendMessage?.includes("RegisterRequest.MailAddress")
        ) {
          form.setError("email", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        } else if (backendMessage?.includes("RegisterRequest.Password")) {
          form.setError("password", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        } else if (
          backendMessage === "capacity required when has_car is true" ||
          backendMessage?.includes("RegisterRequest.Capacity")
        ) {
          // capacity はフロントでは maxPassengers に対応させる
          form.setError("maxPassengers", {
            type: "server",
            message: localized,
          });
          handledByFieldError = true;
        }
      }

      // フィールドに紐付けられなかったものだけをフォーム下に表示
      if (!handledByFieldError) {
        setApiError(message);
      }

      // ★ バリデーションに限らず、エラーはスナックバーにも表示
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
