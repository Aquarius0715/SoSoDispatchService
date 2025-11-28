// src/components/Resister/schema.ts
import { z } from "zod";

// 日本語 (ひらがな・カタカナ・漢字) を含む全ての「文字」 + 数字 + アンダースコア
// 3〜30文字を許可
const usernameRegex = new RegExp("^[\\p{L}\\p{N}_]{3,30}$", "u");

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .email("メールアドレスの形式が正しくありません"),

    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .max(72, "パスワードは72文字以内で入力してください"),

    passwordConfirm: z
      .string()
      .min(8, "確認用のパスワードを入力してください")
      .max(72, "パスワードは72文字以内で入力してください"),

    username: z
      .string()
      .trim()
      .regex(
        usernameRegex,
        "ユーザー名は3〜30文字の日本語・英数字とアンダースコアのみ使用できます",
      ),

    hasCar: z.boolean(),

    // 入力は文字列で持っておいて、送信前に Number() に変換
    maxPassengers: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "パスワードが一致しません",
      });
    }

    if (data.hasCar) {
      if (!data.maxPassengers || data.maxPassengers.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxPassengers"],
          message: "車を持っている場合は最大乗車人数を入力してください",
        });
      } else if (Number.isNaN(Number(data.maxPassengers))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxPassengers"],
          message: "数字で入力してください",
        });
      }
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
