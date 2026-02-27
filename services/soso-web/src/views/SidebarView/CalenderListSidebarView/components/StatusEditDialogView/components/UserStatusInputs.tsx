"use client";

import React, { useCallback } from "react";
import type {
  Control,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { useController, useFormContext } from "react-hook-form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { StatusEditValues } from "../schema";

type Props = {
  control: Control<StatusEditValues>;
  hasCar: boolean;

  // hasCar 切替時に capacity を正規化するために必要
  setValue: UseFormSetValue<StatusEditValues>;
  getValues: UseFormGetValues<StatusEditValues>;
  clearErrors: UseFormClearErrors<StatusEditValues>;
};

export const UserStatusInputs: React.FC<Props> = ({
  control,
  hasCar,
  setValue,
  getValues,
  clearErrors,
}) => {
  const { formState } = useFormContext<StatusEditValues>();

  // --- fields (FormField を使わずに制御) ---
  const { field: usernameField } = useController({
    control,
    name: "username",
  });

  const { field: mailAddressField } = useController({
    control,
    name: "mailAddress",
  });

  const { field: hasCarField } = useController({
    control,
    name: "hasCar",
  });

  const { field: capacityField } = useController({
    control,
    name: "capacity",
  });

  // --- errors ---
  const usernameError = formState.errors.username?.message;
  const mailAddressError = formState.errors.mailAddress?.message;
  const hasCarError = formState.errors.hasCar?.message;
  const capacityError = formState.errors.capacity?.message;

  const normalizeCapacityByHasCar = useCallback(
    (nextHasCar: boolean) => {
      if (!nextHasCar) {
        // 車なし → capacity は 0 固定（schema 対応）
        setValue("capacity", 0, {
          shouldValidate: true,
          shouldDirty: true,
        });
        clearErrors("capacity");
        return;
      }

      // 車あり → capacity が 0 のままだと選択肢に無いので 1 に戻す
      const cur = getValues("capacity");
      if (cur === 0) {
        setValue("capacity", 1, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [setValue, getValues, clearErrors]
  );

  const handleHasCarChange = useCallback(
    (val: string) => {
      const nextHasCar = val === "true";
      hasCarField.onChange(nextHasCar);
      normalizeCapacityByHasCar(nextHasCar);
    },
    [hasCarField, normalizeCapacityByHasCar]
  );

  return (
    <div className="space-y-5">
      {/* mailAddress は UI に出さないが、必須なので hidden でフォームに保持 */}
      <input type="hidden" {...mailAddressField} />
      {mailAddressError && (
        <p className="text-xs text-red-600">{mailAddressError}</p>
      )}

      {/* ユーザー名 */}
      <FormItem className="space-y-1.5">
        <FormLabel className="text-sm font-medium text-slate-700">
          ユーザー名
        </FormLabel>
        <FormControl>
          <Input placeholder="ユーザー名" {...usernameField} />
        </FormControl>
        {usernameError && <p className="text-xs text-red-600">{usernameError}</p>}
      </FormItem>

      {/* 車の有無 */}
      <FormItem className="space-y-3">
        <FormLabel className="text-sm font-medium text-slate-700">
          車の有無
        </FormLabel>
        <FormControl>
          <RadioGroup
            className="flex items-center gap-6"
            value={hasCarField.value ? "true" : "false"}
            onValueChange={handleHasCarChange}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="true" id="hasCar-yes" />
              <FormLabel
                htmlFor="hasCar-yes"
                className="cursor-pointer font-normal text-slate-700"
              >
                あり
              </FormLabel>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="false" id="hasCar-no" />
              <FormLabel
                htmlFor="hasCar-no"
                className="cursor-pointer font-normal text-slate-700"
              >
                なし
              </FormLabel>
            </div>
          </RadioGroup>
        </FormControl>
        {hasCarError && <p className="text-xs text-red-600">{hasCarError}</p>}
      </FormItem>

      {/* 最大乗車人数 */}
      {hasCar && (
        <FormItem className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <FormLabel className="text-sm font-medium text-slate-700">
            最大乗車人数{" "}
            <span className="text-xs text-slate-400">（運転手を除く）</span>
          </FormLabel>
          <FormControl>
            <select
              className={cn(
                "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              value={capacityField.value ?? 1}
              onChange={(e) => capacityField.onChange(Number(e.target.value))}
              onBlur={capacityField.onBlur}
              ref={capacityField.ref}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}人
                </option>
              ))}
            </select>
          </FormControl>
          {capacityError && (
            <p className="text-xs text-red-600">{capacityError}</p>
          )}
        </FormItem>
      )}
    </div>
  );
};
