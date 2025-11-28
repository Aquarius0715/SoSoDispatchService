// src/components/Login/LoginForm.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";

import type { LoginFormValues } from "./schema";
import type { LoginResult } from "@/requests/authAPI";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  result: LoginResult | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  form,
  onSubmit,
  apiError,
  result,
}) => {
  const {
    control,
    formState: { isSubmitting, isSubmitSuccessful },
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

        {/* ログインボタン */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? "送信中..." : "ログイン"}
        </Button>

        {/* 新規登録ボタン */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          asChild
        >
          <Link href="/resister">新規登録</Link>
        </Button>
      </form>
    </Form>
  );
};
