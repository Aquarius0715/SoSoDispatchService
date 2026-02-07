import React from "react";
import { Control } from "react-hook-form";
import { Clock, MapPin, Users } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { EventAddValues } from "../schema";

// 仮の参加者データ（本来は親からPropsで受け取るか、フックで取得する）
const MOCK_PARTICIPANTS = [
  { id: "1", name: "山田 太郎" },
  { id: "2", name: "鈴木 花子" },
  { id: "3", name: "佐藤 次郎" },
];

interface EventFormInputsProps {
  control: Control<EventAddValues>;
  // 必要に応じて参加者リストもPropsで受け取る
  // participants: { id: string; name: string }[];
}

export const EventFormInputs = ({ control }: EventFormInputsProps) => {
  return (
    <div className="grid gap-4 py-4 px-1">
      {/* --- タイトル --- */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>タイトル</FormLabel>
            <FormControl>
              <Input placeholder="イベント名を入力" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- 詳細 --- */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>詳細</FormLabel>
            <FormControl>
              <Textarea
                placeholder="詳細情報を入力"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- 時間設定 (2カラム) --- */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="dropOffTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 送り時刻
              </FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="pickUpTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 迎え時刻
              </FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- 人数設定 (2カラム) --- */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="dropOffCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>送り人数</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="pickUpCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>迎え人数</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- 場所設定 (2カラム) --- */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="originLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> 出発地
              </FormLabel>
              <FormControl>
                <Input placeholder="例: 大学" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="destinationLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> 目的地
              </FormLabel>
              <FormControl>
                <Input placeholder="例: 会場" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- 参加者リスト (Checkbox Array) --- */}
      <FormField
        control={control}
        name="participantUserIds"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> 参加者候補
            </FormLabel>
            <div className="border rounded-md p-4 space-y-3 bg-gray-50/50">
              {MOCK_PARTICIPANTS.length > 0 ? (
                MOCK_PARTICIPANTS.map((user) => (
                  <FormField
                    key={user.id}
                    control={control}
                    name="participantUserIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={user.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(user.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, user.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== user.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {user.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  メンバーがいません
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};