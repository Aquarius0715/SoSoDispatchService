import clsx from 'clsx';
import React from 'react';

interface Props {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

function Button(props: Props) {
  const className =
    'px-4 py-2 text-white-0 font-bold text-md rounded-lg' +
    (props.className ? ` ${props.className}` : '');
  return (
    <button className={clsx(className)} onClick={props.onClick} disabled={props.disabled}>
      <div className={clsx('flex items-center')}>{props.children}</div>
    </button>
  );
}

export default Button;