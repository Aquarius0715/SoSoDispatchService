"use client";

import * as React from "react";

import { createCalendarSchema } from "./schema";

type FieldErrors = {
  name?: string;
  description?: string;
};

type Args = {
  open: boolean;
  calendarName: string;
  calendarDescription: string;
  createDisabled: boolean;
  onCreate: () => void;
};

type Result = {
  errors: FieldErrors;
  onSubmit: (e: React.FormEvent) => void;
};

/**
 * CreateCalendarDialog の入力バリデーションと submit ロジックをカプセル化する。
 */
export function useCreateCalendarDialog({
  open,
  calendarName,
  calendarDescription,
  createDisabled,
  onCreate,
}: Args): Result {
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  const parsed = React.useMemo(
    () =>
      createCalendarSchema.safeParse({
        name: calendarName,
        description: calendarDescription,
      }),
    [calendarName, calendarDescription]
  );

  const errors = React.useMemo<FieldErrors>(() => {
    if (!submitted || parsed.success) return {};
    const flat = parsed.error.flatten().fieldErrors;
    return {
      name: flat.name?.[0],
      description: flat.description?.[0],
    };
  }, [parsed, submitted]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      if (createDisabled) return;
      if (!parsed.success) return;

      onCreate();
    },
    [createDisabled, onCreate, parsed]
  );

  return { errors, onSubmit };
}
