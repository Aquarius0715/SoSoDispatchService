"use client";

import React from "react";
import { useRegisterView } from "./useRegisterView";

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

export function RegisterView() {
  const { form, onSubmit } = useRegisterView();

  const {
    control,
    formState: { isSubmitting, errors },
  } = form;

  const rootMessage = errors.root?.server?.message;

  const hasCar = form.watch("hasCar");

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-slate-50 px-8 py-10 shadow-sm"
      >
        <h2 className="mb-2 text-lg font-semibold text-slate-800">会員登録</h2>

        {rootMessage && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {rootMessage}
          </div>
        )}

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
                <Input type="password" autoComplete="new-password" {...field} />
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
                <Input type="password" autoComplete="new-password" {...field} />
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
}
