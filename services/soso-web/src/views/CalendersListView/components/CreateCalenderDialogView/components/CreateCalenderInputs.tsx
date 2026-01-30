import * as React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldErrors = {
  name?: string;
  description?: string;
};

type Props = {
  name: string;
  description: string;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  errors?: FieldErrors;
};

export function CreateCalenderInputs({
  name,
  description,
  onChangeName,
  onChangeDescription,
  errors,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calender-name">カレンダー名</Label>
        <Input
          id="calender-name"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="カレンダー名"
          autoComplete="off"
          aria-invalid={!!errors?.name}
          className={cn(
            errors?.name && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="calender-description">説明</Label>
        <Textarea
          id="calender-description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="説明（任意）"
          rows={4}
          aria-invalid={!!errors?.description}
          className={cn(
            errors?.description &&
              "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive">{errors.description}</p>
        ) : null}
      </div>
    </div>
  );
}
