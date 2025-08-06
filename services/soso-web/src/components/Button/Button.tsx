import clsx from 'clsx';
import React from 'react';

interface Props {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'circle'; // 新しい variant Prop
}

function Button(props: Props) {
  const { className, disabled, onClick, children, variant } = props;

  const baseClassName = 'font-bold text-md rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out';
  const defaultClassName = 'px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed';
  const circleClassName = 'w-10 h-10 rounded-full bg-gray-700 text-white text-2xl flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed';

  const appliedClassName = clsx(
    baseClassName,
    {
      '': variant === 'default',
      '!w-10 !h-10 !rounded-full !bg-gray-700 !text-white !text-xl !flex !items-center !justify-center hover:!bg-gray-800': variant === 'circle',
    },
    className
  );

  return (
    <button className={appliedClassName} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;