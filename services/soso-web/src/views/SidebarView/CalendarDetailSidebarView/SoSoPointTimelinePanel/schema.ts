// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/timeline/schema.ts

import { z } from "zod";

export const sosoPointHistorySchema = z.object({
  id: z.coerce.number(),
  calendarId: z.string(),
  userId: z.string(),
  changedAt: z.string(),
  changedBy: z.string().optional(),
  eventId: z.string().optional(),
  oldPoint: z.coerce.number(),
  newPoint: z.coerce.number(),
  pointDelta: z.coerce.number().optional(),
  reason: z.string().optional(),
});

export type SosoPointHistory = z.infer<typeof sosoPointHistorySchema>;

export const sosoPointHistoryListSchema = z.array(sosoPointHistorySchema);
