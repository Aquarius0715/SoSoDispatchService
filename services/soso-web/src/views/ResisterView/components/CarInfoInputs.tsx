import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { RegisterViewValues } from "../schema";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface CarInfoInputsProps {
  control: UseFormReturn<RegisterViewValues>["control"];
  hasCar: boolean;
}

export const CarInfoFields: React.FC<CarInfoInputsProps> = ({ control, hasCar }) => {
  return (
    <>
      <FormField
        control={control}
        name="hasCar"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-sm font-medium text-slate-700">
              車の有無
            </FormLabel>
            <FormControl>
              <RadioGroup
                className="flex items-center gap-6 text-sm text-slate-700"
                value={field.value ? "true" : "false"}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="true" id="hasCar-yes" />
                  <FormLabel
                    htmlFor="hasCar-yes"
                    className="text-sm font-normal text-slate-700"
                  >
                    あり
                  </FormLabel>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="false" id="hasCar-no" />
                  <FormLabel
                    htmlFor="hasCar-no"
                    className="text-sm font-normal text-slate-700"
                  >
                    なし
                  </FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {hasCar && (
        <FormField
          control={control}
          name="maxPassengers"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                最大乗車人数（運転手を除く）
              </FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-100"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <option value="">選択してください</option>
                  <option value="1">1人</option>
                  <option value="2">2人</option>
                  <option value="3">3人</option>
                  <option value="4">4人</option>
                </select>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </>
  );
};