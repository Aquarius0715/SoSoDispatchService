import React, { useState, useRef, useEffect, ReactNode, FC } from 'react';
import clsx from 'clsx';

interface DropdownProps {
  trigger: ReactNode;  // ドロップダウンを開くボタンなど
  children: ReactNode; // ドロップダウンの中身
  className?: string; // オプションで追加のクラス名
}

const Dropdown: FC<DropdownProps> = ({ trigger, children, className }) => {
  // `isOpen` という名前で、メニューが開いているか(true)閉じてるか(false)を管理する
  const [isOpen, setIsOpen] = useState(false);

  // `dropdownRef` という名前で、DOM要素（HTMLのタグ）に印をつける
  // これで「ドロップダウン全体」がどれかを判別する
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 「ドロップダウンの外側をクリックした時」の処理
  useEffect(() => {
    // 画面のどこかがクリックされた時に実行される関数
    const handleClickOutside = (event: MouseEvent) => {
      // もしクリックされた場所が、ドロップダウンの内側じゃなかったら
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // 画面全体でマウスクリックを監視する
    document.addEventListener('mousedown', handleClickOutside);
    // このコンポーネントが不要になったら、監視を解除する（お掃除）
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // []なので、この処理は最初の一回だけ実行される

  return (
    // relative: ドロップダウンメニューを配置する時の基準点になる
    <div ref={dropdownRef} className="relative inline-block">

      {/* 1. トリガー (ボタンなど) */}
      {/* クリックされたら、`isOpen` の状態を反対（true ⇔ false）にする */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* 2. ドロップダウンメニュー */}
      {/* `isOpen` が true の時だけ、中身が表示される */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border ${className}`}
        >
          {/* `py-1` は上下の余白 */}
          <div className="py-1 text-black">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;