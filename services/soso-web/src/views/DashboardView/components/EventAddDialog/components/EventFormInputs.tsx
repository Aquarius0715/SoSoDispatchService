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
import { CalendarMember } from "@/types/interfaces";

import { EventAddValues } from "../schema";

interface EventFormInputsProps {
  control: Control<EventAddValues>;
  // カレンダーの実メンバー（参加者候補）。親(useEventAddDialog)が API から取得して渡す。
  participants: CalendarMember[];
}

export const EventFormInputs = ({ control, participants }: EventFormInputsProps) => {
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
              {participants.length > 0 ? (
                participants.map((member) => (
                  <FormField
                    key={member.id}
                    control={control}
                    name="participantUserIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={member.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(member.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, member.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== member.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {member.username}
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