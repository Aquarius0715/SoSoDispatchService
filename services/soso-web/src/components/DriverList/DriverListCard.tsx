import clsx from 'clsx';
import React from 'react';
import { Drive, DriveState } from './DriverList';

interface Props {
  className?: string;
  drive: Drive;
  children?: React.ReactNode;
}

function DriverListCard({className,drive,children}: Props) {
  const finalClassName =
    'px-4 py-2 text-black font-bold text-md rounded-lg bg-gray-200' +
    (className ? ` ${className}` : '');

  const driveStateText = {
    [DriveState.PICK_UP]: '迎え',
    [DriveState.DROP_OFF]: '送り',
  };

  return (
    <div className={clsx('flex flex-col bg-primary-1 rounded-lg', finalClassName)}>
      <p className='text-sm text-gray-600'>{drive.calenderName}</p>
      <p className='font-medium text-gray-800'>{drive.eventName}</p>
      <p className='text-sm text-gray-600'>{drive.eventDate} {drive.driveTime}</p>
      <p className='text-sm text-gray-600'>{drive.driveState !== undefined && driveStateText[drive.driveState]}: {drive.passengerNumber}</p>
      {children}
    </div>
  );
}
export default DriverListCard;