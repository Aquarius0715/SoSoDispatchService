'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  pageTitle: string;
  onLogout: () => void;
  onClickLogo: () => void;
  calendarUrl: string;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  pageTitle,
  onLogout,
  onClickLogo,
  calendarUrl,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onClickLogo}
          className="text-xl font-bold text-slate-700 hover:text-slate-900"
        >
          SoSo
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        {calendarUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
              カレンダーURL
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onLogout}>
          ログアウト
        </Button>
      </div>
    </header>
  );
};

export default CalendarHeader;

