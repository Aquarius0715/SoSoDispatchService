"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";

import { registerSchema, type RegisterViewValues } from "./schema";
import { registerUser } from "@/requests/userAPI";
import { useSnackbar } from "@/components/ui/snackbar";

// --- Types ---
export interface UseRegisterViewResult {
  form: UseFormReturn<RegisterViewValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const setRootError = (
  form: UseFormReturn<RegisterViewValues>,
  message: string
) => {
  form.setError("root.server", { type: "server", message });
  return message;
};

// --- Helper: エラーハンドリングロジックの分離 ---
const handleRegisterError = (
  error: unknown,
  form: UseFormReturn<RegisterViewValues>
): string => {
  if (!axios.isAxiosError(error)) {
    return setRootError(form, "予期せぬエラーが発生しました");
  }

  const data = error.response?.data as { message?: string } | undefined;
  const backendMessage = data?.message;

  if (!backendMessage) return setRootError(form, "登録に失敗しました");

  // 1. ユーザー名重複 / バリデーション
  if (
    backendMessage === "username already exists" ||
    backendMessage.includes("RegisterRequest.Username")
  ) {
    const msg = "このユーザー名は既に使用されているか、形式が不正です";
    form.setError("username", { type: "server", message: msg });
    return msg;
  }

  // 2. メールアドレス重複 / バリデーション
  if (
    backendMessage === "mailAddress already exists" ||
    backendMessage.includes("RegisterRequest.MailAddress")
  ) {
    const msg = "このメールアドレスは既に使用されているか、形式が不正です";
    form.setError("email", { type: "server", message: msg });
    return msg;
  }

  // 3. パスワード
  if (backendMessage.includes("RegisterRequest.Password")) {
    const msg = "パスワードの形式が正しくありません";
    form.setError("password", { type: "server", message: msg });
    return msg;
  }

  // 4. 車・乗車人数
  if (
    backendMessage === "capacity required when has_car is true" ||
    backendMessage.includes("RegisterRequest.Capacity")
  ) {
    const msg = "乗車人数の値が不正です";
    form.setError("maxPassengers", { type: "server", message: msg });
    return msg;
  }

  // 5. その他サーバーエラーメッセージ
  const messageMap: Record<string, string> = {
    "invalid payload": "送信内容が不正です。入力内容を確認してください",
  };

  return setRootError(form, messageMap[backendMessage] || "登録に失敗しました");
};

// --- Main Hook ---
export function useRegisterView(): UseRegisterViewResult {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

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
    // 前回のエラーをクリア（root + fields）
    form.clearErrors();

    try {
      const capacity =
        values.hasCar && values.maxPassengers
          ? Number(values.maxPassengers)
          : 0;

      await registerUser({
        username: values.username,
        mailAddress: values.email,
        password: values.password,
        hasCar: values.hasCar,
        capacity,
      });

      showSnackbar("登録が完了しました。ログインしてください。", "success");
      router.push("/auth/login");
    } catch (error) {
      const errorMessage = handleRegisterError(error, form);
      showSnackbar(errorMessage, "error");
    }
  });

  return { form, onSubmit };
}
