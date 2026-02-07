'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { EventClickArg, EventInput } from '@fullcalendar/core'; 

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CalendarBoardProps {
  // FullCalendarは EventInput[] を期待するが、EventData[] は構造的に互換性がある
  events: EventInput[]; 
  onEventClick: (info: EventClickArg) => void;
  onAddEventClick: (date: Date) => void;
  className?: string;
}

export const CalendarBoard: React.FC<CalendarBoardProps> = ({ 
  events, 
  onEventClick, 
  onAddEventClick,
  className 
}) => {
  return (
    <div className={`flex-grow p-6 overflow-y-auto ${className || ''}`}>
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
            eventClick={onEventClick} // 型が一致したのでそのまま渡せる
            
            dayCellContent={(arg) => (
              <div className="relative w-full h-full group p-1">
                <div className="absolute top-1 right-2 text-sm font-medium text-muted-foreground pointer-events-none z-10">
                  {arg.dayNumberText.replace('日', '')}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 z-20"
                  aria-label="予定を追加"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEventClick(arg.date); // Date型をそのまま渡す
                  }}
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
            
            eventContent={(arg) => (
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