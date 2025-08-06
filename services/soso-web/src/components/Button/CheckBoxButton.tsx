import React from 'react';
import clsx from 'clsx';

// propsの型を定義するinterface
interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// React.FCを使ってコンポーネントに型を適用
const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <input
      type="checkbox"
      className={clsx(
        'form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded',
        {
          'bg-blue-100': checked,
        }
      )}
      checked={checked}
      onChange={onChange}
    />
  );
};

export default Checkbox;