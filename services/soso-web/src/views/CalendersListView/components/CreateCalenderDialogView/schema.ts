import { z } from "zod";

/**
 * カレンダー作成ダイアログ入力
 * - name: 必須（空白のみは不可）
 * - description: 任意（空白のみは undefined に正規化）
 */
export const createCalenderSchema = z.object({
  name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "カレンダー名を入力してください")
  ),
  description: z.preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const t = v.trim();
      return t.length === 0 ? undefined : t;
    },
    z.string().optional()
  ),
});

export type CreateCalenderSchema = z.infer<typeof createCalenderSchema>;
