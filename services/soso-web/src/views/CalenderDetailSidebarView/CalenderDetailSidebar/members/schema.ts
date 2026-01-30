// src/views/CalenderDetailSidebarView/CalenderDetailSidebar/members/schema.ts

import { z } from "zod";

export const calenderMemberSchema = z.object({
  id: z.string(),
  username: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v : "")),
  hasCar: z.boolean(),
  capacity: z.coerce.number(),
  sosoPoint: z.coerce.number(),
});

export type CalenderMember = z.infer<typeof calenderMemberSchema>;

export const calenderMemberListSchema = z.array(calenderMemberSchema);
