'use client';
import React,{useState} from "react";
import clsx from "clsx";
import Button from "../Button/Button";
import Image from "next/image";

interface Props {
  className?: string;
  pageTitle: string;
  onLogout: () => void; // ログアウト処理を受け取る関数
  onClickLogo?: () => void; // ロゴクリック時の処理を受け取る関数（オプション）
  calendarUrl?: string; // カレンダー共有のURL（オプション）
}

function CalendarHeader({ className, pageTitle, onLogout, onClickLogo, calendarUrl }: Props) {
    const [showPopup, setShowPopup] = useState(false);
    if (!calendarUrl) {
    alert('共有できるカレンダーのURLが設定されていません。');
        return; // 関数をここで終了
    }
  // 2. 「カレンダー共有」ボタンがクリックされたときの処理をまとめた関数
  const handleShareClick = () => {
    // クリップボードにURLをコピー
    navigator.clipboard.writeText(calendarUrl)
      .then(() => {
        // コピーが成功したら、ポップアップを表示
        setShowPopup(true);
        // 3秒後にポップアップを自動的に非表示にする
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
      })
      .catch(err => {
        // コピーが失敗した場合のエラーハンドリング
        console.error('クリップボードへのコピーに失敗しました。', err);
        alert('URLのコピーに失敗しました。');
      });
  };
  return (
    <header className={clsx("bg-gray-500 shadow-md p-4 flex justify-between items-center", className)}>
      <div className="flex items-center gap-3"> {/* gap-3で間隔を調整 */}
        {/* アイコン部分 */}
        <button onClick={onClickLogo}>
          <Image
            src="/icons/soso_icon.svg"
            alt="SoSo Logo"
            width={40}
            height={40}
          />
        </button>
        {/* タイトル部分 (重複をなくし、こちらに一本化) */}
        <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
      </div>
    <div className="flex items-center gap-2">
      <Button  className="bg-gray-400 text-white hover:bg-gray-800" onClick={handleShareClick}>
        <span className="text-white">カレンダー共有</span>
      </Button>
      <Button  className="bg-gray-700 text-white hover:bg-gray-800" onClick={onLogout}>
        <span className="text-white">ログアウト</span>
      </Button>
    </div>
    </header>
  );
}

export default CalendarHeader;