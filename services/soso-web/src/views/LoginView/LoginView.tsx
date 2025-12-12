"use client";

import React from "react";
import type { UseLoginViewResult } from "./useLoginView";

import { LoginButton } from "./components/LoginButton";
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

// Hookの戻り値とUIが必要とするPropsを合わせる
// これにより、Hookの型が変わった時に検知しやすくなります
type LoginViewProps = UseLoginViewResult;

export const LoginView: React.FC<LoginViewProps> = ({
  form,
  onSubmit,
  apiError, // 必要であればエラーメッセージをフォーム上部に表示するために使用
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

        {/* --- Global Error Message (Optional) --- */}
        {apiError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        {/* --- Email Field --- */}
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
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* --- Password Field --- */}
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-slate-700">
                パスワード
              </FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  autoComplete="current-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* --- Actions --- */}
        <LoginButton isSubmitting={isSubmitting} />
        <RegisterButton />
      </form>
    </Form>
  );
};