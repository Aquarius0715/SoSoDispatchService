import React from "react";
import clsx from "clsx";
import Button from "../Button/Button";
import Image from "next/image";

interface Props {
  className?: string;
  pageTitle: string;
  onLogout: () => void; // ログアウト処理を受け取る関数
  onClickLogo?: () => void; // ロゴクリック時の処理を受け取る関数（オプション）
}

function MyPageHeader({ className, pageTitle, onLogout, onClickLogo }: Props) {
  return (
    <header className={clsx("bg-gray-500 shadow-md p-4 flex justify-between items-center", className)}>
      <div className="flex items-center">
      <button onClick={onClickLogo} className="flex items-center">
        <Image
          src="/icons/soso_icon.svg"
          alt="SoSo Logo"
          width={40}
          height={40}
          className=""
        />
      </button>
      <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
    </div>
      <Button className="bg-gray-700 hover:bg-gray-800" onClick={onLogout}>
        ログアウト
      </Button>
    </header>
  );
}

export default MyPageHeader;