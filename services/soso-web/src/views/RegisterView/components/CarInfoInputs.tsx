import React from "react";
import type { Control } from "react-hook-form";
import type { RegisterViewValues } from "../schema";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils"; // クラス名結合ユーティリティ（shadcn/ui標準）

export interface CarInfoInputsProps {
  // UseFormReturn["control"] より Control<T> の方が簡潔です
  control: Control<RegisterViewValues>;
  hasCar: boolean;
}

export const CarInfoFields: React.FC<CarInfoInputsProps> = ({
  control,
  hasCar,
}) => {
  return (
    <>
      {/* --- 車の有無 (Radio) --- */}
      <FormField
        control={control}
        name="hasCar"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-medium text-slate-700">
              車の有無
            </FormLabel>
            <FormControl>
              <RadioGroup
                className="flex items-center gap-6"
                // boolean -> string ("true"/"false") に変換してバインド
                value={field.value ? "true" : "false"} 
                onValueChange={(val) => field.onChange(val === "true")}
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
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* --- 最大乗車人数 (Select) --- */}
      {hasCar && (
        <FormField
          control={control}
          name="maxPassengers"
          render={({ field }) => (
            <FormItem className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <FormLabel className="text-sm font-medium text-slate-700">
                最大乗車人数 <span className="text-xs text-slate-400">（運転手を除く）</span>
              </FormLabel>
              <FormControl>
                {/* NOTE: shadcn/ui の <Select> コンポーネントがあればそちらを使うべきですが、
                  ここではネイティブの <select> を使いつつ、Inputと同じスタイル(cn)を適用します。
                */}
                <select
                  className={cn(
                    "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    // 入力がない時(placeholder)の色調整
                    !field.value && "text-slate-500"
                  )}
                  {...field} // onChange, onBlur, value, ref を展開
                  // 明示的に onChange を書くなら: onChange={(e) => field.onChange(e.target.value)}
                  // ※ Schemaに合わせて String のまま扱います
                >
                  <option value="">選択してください</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num}人
                    </option>
                  ))}
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