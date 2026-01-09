'use client';

import React from 'react';
import { SOSOTransaction } from '@/components/SOSOList/SOSOList';

interface CalendarRightSidebarProps {
  logs: SOSOTransaction[];
  className?: string;
}

const CalendarRightSidebar: React.FC<CalendarRightSidebarProps> = ({
  logs,
  className = '',
}) => {
  return (
    <aside className={`w-64 bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">SOSO取引履歴</h2>
        <div className="space-y-2">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-md hover:bg-gray-50 text-sm text-gray-700"
              >
                <div className="font-medium">{log.description}</div>
                {log.amount !== undefined && (
                  <div className="text-xs text-gray-500">{log.amount} SOSO</div>
                )}
                {log.date && (
                  <div className="text-xs text-gray-500">{log.date}</div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">取引履歴がありません</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CalendarRightSidebar;

