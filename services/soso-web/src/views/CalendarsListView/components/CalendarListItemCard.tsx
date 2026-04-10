// src/views/CalendarsListView/components/CalendarListItemCard.tsx

import Link from "next/link";

import type { Calendar } from "@/types/interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalendarListItemCard({ calendar }: { calendar: Calendar }) {
  return (
    <Card className="hover:bg-accent/40 transition-colors">
      <Link href={`/calendars/${calendar.id}`} className="block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{calendar.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {calendar.description?.trim() ? calendar.description : "説明はありません"}
        </CardContent>
      </Link>
    </Card>
  );
}
