// src/views/CalendersListView/components/CalenderListItemCard.tsx

import Link from "next/link";

import type { Calender } from "@/types/interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalenderListItemCard({ calender }: { calender: Calender }) {
  return (
    <Card className="hover:bg-accent/40 transition-colors">
      <Link href={`/calenders/${calender.id}`} className="block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{calender.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {calender.description?.trim() ? calender.description : "説明はありません"}
        </CardContent>
      </Link>
    </Card>
  );
}
