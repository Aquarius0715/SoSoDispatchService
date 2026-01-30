'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { EventInput } from '@fullcalendar/core';

// ▼ shadcn/ui のコンポーネントをインポート
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // アイコン

interface CalendarMainViewProps {
  events: EventInput[];
  onEventClick: (clickInfo: any) => void;
  onAddEventClick: (e: React.MouseEvent, arg: any) => void;
  className?: string;
}

export default function CalendarMainView({ 
  events, 
  onEventClick, 
  onAddEventClick,
  className 
}: CalendarMainViewProps) {
  return (
    <div className={`flex-grow p-6 overflow-y-auto ${className || ''}`}>
      {/* ▼ Cardコンポーネントでラップして統一感を出す */}
      <Card className="h-full shadow-sm border-gray-200">
        <CardContent className="h-full p-4 [&_.fc-toolbar-title]:text-xl [&_.fc-button]:bg-primary [&_.fc-button]:text-primary-foreground">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={jaLocale}
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            height="100%"
            events={events}
            eventClick={onEventClick}
            
            // ▼ 日付セルのカスタマイズ（shadcn化）
            dayCellContent={(arg) => (
              // groupクラス: ホバー時の制御用
              <div className="relative w-full h-full group p-1">
                {/* 日付数字: text-muted-foregroundで落ち着いた色に */}
                <div className="absolute top-1 right-2 text-sm font-medium text-muted-foreground pointer-events-none z-10">
                  {arg.dayNumberText.replace('日', '')}
                </div>
                
                {/* 追加ボタン: shadcnのButtonに変更 */}
                <Button
                  variant="ghost" // 背景なしの幽霊ボタン
                  size="icon"     // アイコン用の正方形サイズ
                  onClick={(e) => onAddEventClick(e, arg)}
                  // group-hover:opacity-100 でマウスが乗った時だけ表示（スマホでは常時表示などを検討しても良い）
                  className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 z-20"
                  aria-label="予定を追加"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
            
            // ▼ イベント表示のカスタマイズ
            eventContent={(arg) => (
              // イベントも角丸にして少しモダンに
              <div className="flex items-center justify-center w-full h-full text-xs font-medium text-center truncate px-1 cursor-pointer rounded-sm hover:opacity-80 transition-opacity text-black">
                {arg.event.title}
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}