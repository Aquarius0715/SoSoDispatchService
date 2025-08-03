import clsx from 'clsx';
import React from 'react';

export enum driveState {
  pickUp,  // 迎え
  dropOff, // 送り
}

interface Props {
  className?: string;
  calenderName?: string;
  eventName?: string;
  driveState?: driveState;
  eventDate?: string;
  driveTime?: string;
  passengerNumber?: number;
  children?: React.ReactNode;
}

function DriverListCard(props: Props) {
  const className =
    'px-4 py-2 text-black font-bold text-md rounded-lg bg-gray-200' +
    (props.className ? ` ${props.className}` : '');

  const driveStateText = {
    [driveState.pickUp]: '迎え',
    [driveState.dropOff]: '送り',
  };

  return (
    <div className={clsx('flex flex-col bg-primary-1 rounded-lg', className)}>
      <p className='text-sm text-gray-600'>{props.calenderName}</p>
      <p className='font-medium text-gray-800'>{props.calenderName}</p>
      <p className='text-sm text-gray-600'>{props.eventDate} {props.driveTime}</p>
      <p className='text-sm text-gray-600'>{props.driveState !== undefined && driveStateText[props.driveState]}: {props.passengerNumber}</p>
      {props.children}
    </div>
  );
}
export default DriverListCard;