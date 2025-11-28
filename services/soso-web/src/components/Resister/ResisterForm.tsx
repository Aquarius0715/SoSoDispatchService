// src/components/Resister/ResisterForm.tsx
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";

import type { RegisterFormValues } from "./schema";
import type { User } from "@/requests/userAPI";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface RegisterFormProps {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: User | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  form,
  onSubmit,
  apiError,
  // result はもう画面で使わないので受け取らない（propsには残してOK）
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = form;

  const hasCar = form.watch("hasCar");

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-slate-50 px-8 py-10 shadow-sm"
      >
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          会員登録
        </h2>

        {/* メールアドレス */}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                メールアドレス
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* ユーザー名 */}
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                ユーザー名
              </FormLabel>
              <FormControl>
                <Input placeholder="yamada_taro" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* パスワード */}
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                パスワード
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* パスワード確認 */}
        <FormField
          control={control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                パスワード（確認）
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* 車の有無（RadioGroup あり／なし） */}
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

        {/* 最大乗車人数（運転手を除く） → 1〜4 のドロップダウン */}
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
                    onChange={(e) => field.onChange(e.target.value)}
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? "送信中..." : "会員登録"}
        </Button>
      </form>
    </Form>
  );
};
