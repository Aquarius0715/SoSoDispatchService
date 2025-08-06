// src/components/TimePicker.jsx

import React, { useState } from 'react';

const TimePicker = () => {
  const [time, setTime] = useState('--:--');
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeSelect = (selectedTime: string): void => {
    setTime(selectedTime);
    setIsOpen(false);
};

  const handleTimePickerClick = () => {
    // タイムピッカーUIの表示・非表示を切り替える
    setIsOpen(!isOpen);
    console.log('タイムピッカーをクリックしました');
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  return (
    <div
      className="relative flex items-center justify-between w-64 p-3 border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-gray-400"
      onClick={handleTimePickerClick}
    >
      <span className="text-xl font-medium text-gray-700">{time}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {/* タイムピッカーUI */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {generateTimeOptions().map((t) => (
            <div
              key={t}
              className="p-2  text-black cursor-pointer hover:bg-gray-100"
              onClick={() => handleTimeSelect(t)}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimePicker;