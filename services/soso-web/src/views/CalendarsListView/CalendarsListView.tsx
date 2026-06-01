// src/views/CalendarsListView/CalendarsListView.tsx
"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useCalendarsListView } from "./useCalendarsListView";
import { CalendarListItemCard } from "./components/CalendarListItemCard";
import { CreateCalendarDialog } from "./components/CreateCalendarDialogView/CreateCalendarDialog";
import { JoinCalendarDialog } from "./components/JoinCalendarDialogView/JoinCalandarDialog";

export function CalendarsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteCalenderId = searchParams.get("calenderId");
  const inviteOpen = Boolean(inviteCalenderId);
  const {
    calendars,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    newCalendarName,
    setNewCalendarName,
    newCalendarDescription,
    setNewCalendarDescription,
    create,
    createDisabled,
    reload,
  } = useCalendarsListView();

  const closeInvite = () => {
    router.replace("/calendars");
  };

  return (
    <div className="relative flex h-full flex-col">
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle>参加しているカレンダー一覧</CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="min-h-0 flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-6 pb-28 pr-8">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/5" />
                        <div className="mt-3">
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : calendars.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    まだ参加しているカレンダーがありません。
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {calendars.map((c) => (
                    <CalendarListItemCard key={c.id} calendar={c} />
                  ))}
                </div>
              )}
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* FAB */}
      <Button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        aria-label="カレンダーを追加"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreateCalendarDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        calendarName={newCalendarName}
        onChangeName={setNewCalendarName}
        calendarDescription={newCalendarDescription}
        onChangeDescription={setNewCalendarDescription}
        onCreate={create}
        createDisabled={createDisabled}
      />

      <JoinCalendarDialog
        open={inviteOpen}
        calenderId={inviteCalenderId}
        onClose={closeInvite}
        onJoined={reload}
      />
    </div>
  );
}