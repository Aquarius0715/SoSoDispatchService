import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  registerParticipant,
  registerGoDriver,
  registerReturnDriver,
  registerBothDriver,
  registerGoRider,
  registerReturnRider,
  registerBothRider,
} from "@/requests/eventAPI";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onComplete?: () => void;
};

type Step = "choose-role" | "choose-driver-direction" | "choose-rider-direction";

export function EventParticipateDialog({
  open,
  onOpenChange,
  eventId,
  onComplete,
}: Props) {
  const [step, setStep] = useState<Step>("choose-role");

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setStep("choose-role");
    onOpenChange(isOpen);
  };

  const handleParticipantOnly = async () => {
    await registerParticipant(eventId);
    setStep("choose-rider-direction");
  };

  const handleDriver = () => {
    setStep("choose-driver-direction");
  };

  const handleDirection = async (
    register: (eventId: string) => Promise<void>
  ) => {
    await register(eventId);
    onComplete?.();
    handleClose(false);
  };

  const handleNoRider = () => {
    onComplete?.();
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "choose-role" && (
          <>
            <DialogHeader>
              <DialogTitle>参加方法を選択</DialogTitle>
              <DialogDescription>
                このイベントへの参加方法を選んでください
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="outline" onClick={handleParticipantOnly}>
                参加者（運転なし）
              </Button>
              <Button variant="outline" onClick={handleDriver}>
                参加者（ドライバー）
              </Button>
            </div>
          </>
        )}

        {step === "choose-driver-direction" && (
          <>
            <DialogHeader>
              <DialogTitle>担当する方向を選択</DialogTitle>
              <DialogDescription>
                ドライバーとして担当する方向を選んでください
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleDirection(registerGoDriver)}
              >
                迎えだけ（行き）
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDirection(registerReturnDriver)}
              >
                送りだけ（帰り）
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDirection(registerBothDriver)}
              >
                両方（行き＋帰り）
              </Button>
            </div>
          </>
        )}

        {step === "choose-rider-direction" && (
          <>
            <DialogHeader>
              <DialogTitle>送迎は必要ですか？</DialogTitle>
              <DialogDescription>
                誰かの車に乗せてもらう場合は方向を選んでください
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleDirection(registerGoRider)}
              >
                行きだけ乗せてほしい
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDirection(registerReturnRider)}
              >
                帰りだけ乗せてほしい
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDirection(registerBothRider)}
              >
                両方乗せてほしい
              </Button>
              <Button
                variant="outline"
                onClick={handleNoRider}
              >
                送迎不要（自分で行く）
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
