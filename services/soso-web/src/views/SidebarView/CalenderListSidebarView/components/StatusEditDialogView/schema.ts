import { z } from "zod";

// register と同じルールを使うなら共通化してもOK
const usernameRegex = new RegExp("^[\\p{L}\\p{N}_]{3,30}$", "u");

export const statusEditSchema = z
  .object({
    username: z
      .string()
      .trim()
      .regex(
        usernameRegex,
        "ユーザー名は3〜30文字の日本語・英数字とアンダースコアのみ使用できます"
      ),

    // サーバが required なので必須
    mailAddress: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .email("メールアドレスの形式が正しくありません"),

    hasCar: z.boolean(),

    // 入力自体は number で持つ（UIは select）
    capacity: z.number().int(),
  })
  .superRefine((data, ctx) => {
    // hasCar=true のとき capacity は 1..8 を必須
    if (data.hasCar) {
      if (!Number.isInteger(data.capacity) || data.capacity < 1 || data.capacity > 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capacity"],
          message: "車を持っている場合は最大乗車人数を1〜8で選択してください",
        });
      }
    } else {
      // hasCar=false のとき capacity は 0 であるべき（後段の submit で 0 に潰す運用でもOK）
      if (data.capacity !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capacity"],
          message: "車がない場合は最大乗車人数は0です",
        });
      }
    }
  });

export type StatusEditValues = z.infer<typeof statusEditSchema>;
