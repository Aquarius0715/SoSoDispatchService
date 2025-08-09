'use client';
import React, { useState } from "react";
import clsx from "clsx";
import Button from "../Button/Button";
import Image from "next/image";
import ShareCalendarModal from '../Modal/ShareCalendarModal';

interface Props {
  className?: string;
  pageTitle: string;
  onLogout: () => void;
  onClickLogo?: () => void;
  calendarUrl?: string;
}

const CalendarHeader: React.FC<Props> = ({ className, pageTitle, onLogout, onClickLogo, calendarUrl }) => {
  const [showModal, setShowModal] = useState(false);

  const handleShareClick = () => {
    if (!calendarUrl) {
      alert('共有できるカレンダーのURLが設定されていません。');
      return;
    }

    navigator.clipboard.writeText(calendarUrl)
      .then(() => {
        setShowModal(true);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました。', err);
        alert('URLのコピーに失敗しました。');
      });
  };

  return (
    <>
      <header className={clsx("bg-gray-500 shadow-md p-4 flex justify-between items-center", className)}>
        <div className="flex items-center gap-3">
          <button onClick={onClickLogo}>
            <Image
              src="/icons/soso_icon.svg"
              alt="SoSo Logo"
              width={40}
              height={40}
            />
          </button>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-gray-400 text-white hover:bg-gray-800 px-6 py-3">
            <span className="text-white">カレンダー共有</span>
          </Button>
          <Button className="bg-gray-700 text-white hover:bg-gray-800 px-6 py-3">
            <span className="text-white">ログアウト</span>
          </Button>
        </div>
      </header>

      {showModal && calendarUrl && (
        <ShareCalendarModal url={calendarUrl} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default CalendarHeader;