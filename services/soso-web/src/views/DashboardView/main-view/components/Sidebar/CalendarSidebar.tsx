'use client';

import React from 'react';
import { Member } from '@/views/DashboardView/main-view/components/MemberList/MenberList';

interface CalendarLeftSidebarProps {
  members: Member[];
  className?: string;
}

const CalendarLeftSidebar: React.FC<CalendarLeftSidebarProps> = ({
  members,
  className = '',
}) => {
  return (
    <aside className={`w-64 bg-white border-r border-gray-200 overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">メンバー</h2>
        <div className="space-y-2">
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="p-2 rounded-md hover:bg-gray-50 text-sm text-gray-700"
              >
                {member.name}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">メンバーがいません</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CalendarLeftSidebar;

