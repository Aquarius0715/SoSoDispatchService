// src/views/CalendersListView/components/CreateCalenderDialog.tsx

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CreateCalenderInputs } from "./components/CreateCalenderInputs";
import { useCreateCalenderDialog } from "./useCreateCalenderDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  calenderName: string;
  onChangeName: (value: string) => void;

  calenderDescription: string;
  onChangeDescription: (value: string) => void;

  onCreate: () => void;
  createDisabled: boolean;
};

export function CreateCalenderDialog({
  open,
  onOpenChange,
  calenderName,
  onChangeName,
  calenderDescription,
  onChangeDescription,
  onCreate,
  createDisabled,
}: Props) {
  const { errors, onSubmit } = useCreateCalenderDialog({
    open,
    calenderName,
    calenderDescription,
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
          <CreateCalenderInputs
            name={calenderName}
            description={calenderDescription}
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
