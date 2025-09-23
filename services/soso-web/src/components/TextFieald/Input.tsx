import React from 'react';
import clsx from 'clsx';

interface Props {
  className?: string;
  placeholder?: string;
  id?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; // typeを追加して、inputのタイプを指定できるようにする
  disabled?: boolean; // 追加: 入力を無効化するためのプロパティ
}

const Input: React.FC<Props> = (props) => {
  const className =
    'border rounded-lg py-2 px-4' +
    (props.className ? ` ${props.className}` : '');

  return (
    <input
      type={props.type ?? 'text'}
      className={clsx(className)}
      placeholder={props.placeholder}
      id={props.id}
      value={props.value}
      onChange={props.onChange}
    />
  );
};

export default Input;