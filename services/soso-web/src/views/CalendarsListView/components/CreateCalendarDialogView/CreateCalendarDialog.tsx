// src/views/CalendarsListView/components/CreateCalendarDialog.tsx

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CreateCalendarInputs } from "./components/CreateCalendarInputs";
import { useCreateCalendarDialog } from "./useCreateCalendarDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  calendarName: string;
  onChangeName: (value: string) => void;

  calendarDescription: string;
  onChangeDescription: (value: string) => void;

  onCreate: () => void;
  createDisabled: boolean;
};

export function CreateCalendarDialog({
  open,
  onOpenChange,
  calendarName,
  onChangeName,
  calendarDescription,
  onChangeDescription,
  onCreate,
  createDisabled,
}: Props) {
  const { errors, onSubmit } = useCreateCalendarDialog({
    open,
    calendarName,
    calendarDescription,
    createDisabled,
    onCreate,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>カレンダーを追加</DialogTitle>
          <DialogDescription>新しいカレンダーを作成</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <CreateCalendarInputs
            name={calendarName}
            description={calendarDescription}
            onChangeName={onChangeName}
            onChangeDescription={onChangeDescription}
            errors={errors}
          />

          <DialogFooter>
            <Button type="submit" disabled={createDisabled}>
              新規作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
