// src/views/CalendarDetailSidebarView/CalendarDetailSidebar/members/schema.ts

import { z } from "zod";

export const calendarMemberSchema = z.object({
  id: z.string(),
  username: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v : "")),
  hasCar: z.boolean(),
  capacity: z.coerce.number(),
  sosoPoint: z.coerce.number(),
});

export type CalendarMember = z.infer<typeof calendarMemberSchema>;

export const calendarMemberListSchema = z.array(calendarMemberSchema);
