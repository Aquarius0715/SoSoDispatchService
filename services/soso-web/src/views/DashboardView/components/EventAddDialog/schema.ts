import { z } from "zod";

export const eventAddSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  //date: z.string().min(1, "日付を選択してください"), // YYYY-MM-DD
  dropOffTime: z.string()
                .min(1, "送り時刻を入力してください") // HH:mm
                .regex(/^([01]d|2[0-3]):([0-5]\d)$/, "時刻の形式が不正です"),
  pickUpTime: z.string()
                .min(1, "迎え時刻を入力してください") // HH:mm
                .regex(/^([01]d|2[0-3]):([0-5]\d)$/, "時刻の形式が不正です"),
  dropOffCount: z.preprocess((v) => Number(v), z.number().min(0)),
  pickUpCount: z.preprocess((v) => Number(v), z.number().min(0)),
  originLocation: z.string().min(1, "出発地を入力してください"),
  destinationLocation: z.string().min(1, "目的地を入力してください"),
  participantUserIds: z.array(z.string()),
});

export type EventAddValues = z.infer<typeof eventAddSchema>;