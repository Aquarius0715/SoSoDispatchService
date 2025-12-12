"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";

import type { RegisterViewValues } from "./schema";
import type { User } from "@/requests/userAPI";

import { CarInfoFields } from "./components/CarInfoInputs";
import { RegisterButton } from "./components/RegisterButton";

import { Input } from "@/components/ui/input";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface RegisterViewProps {
  form: UseFormReturn<RegisterViewValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: User | null;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  form,
  onSubmit,
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

        <CarInfoFields control={control} hasCar={hasCar} />
        <RegisterButton isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};