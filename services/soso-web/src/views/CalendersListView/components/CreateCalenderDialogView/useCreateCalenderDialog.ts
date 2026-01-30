"use client";

import * as React from "react";

import { createCalenderSchema } from "./schema";

type FieldErrors = {
  name?: string;
  description?: string;
};

type Args = {
  open: boolean;
  calenderName: string;
  calenderDescription: string;
  createDisabled: boolean;
  onCreate: () => void;
};

type Result = {
  errors: FieldErrors;
  onSubmit: (e: React.FormEvent) => void;
};

/**
 * CreateCalenderDialog の入力バリデーションと submit ロジックをカプセル化する。
 */
export function useCreateCalenderDialog({
  open,
  calenderName,
  calenderDescription,
  createDisabled,
  onCreate,
}: Args): Result {
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  const parsed = React.useMemo(
    () =>
      createCalenderSchema.safeParse({
        name: calenderName,
        description: calenderDescription,
      }),
    [calenderName, calenderDescription]
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
