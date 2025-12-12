"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";

import type { LoginViewValues } from "./schema";
import type { LoginResult } from "@/requests/authAPI";

import { LoginButton } from "./components/LoginButton";
import { RegisterButton } from "./components/ToRegisterPageButton";

import { Input } from "@/components/ui/input";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface LoginViewProps {
  form: UseFormReturn<LoginViewValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: LoginResult | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  form,
  onSubmit,
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-slate-50 px-8 py-10 shadow-sm"
      >
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          ログイン
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
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
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

        {/* ログインボタン (抽出) */}
        <LoginButton isSubmitting={isSubmitting} />

        {/* 新規登録ボタン (抽出) */}
        <RegisterButton />
      </form>
    </Form>
  );
};