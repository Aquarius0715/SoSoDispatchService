import clsx from 'clsx';
import React from 'react';
import DriverListCard from './DriverListCard';

export enum DriveState {
  PICK_UP,  // 迎え
  DROP_OFF, // 送り
}

export interface Drive {
  id: number | string;
  calenderName: string;
  eventName: string;
  driveState: DriveState;
  eventDate: string;
  driveTime: string;
  passengerNumber: number;
}

interface Props {
    drives: Drive[];
}

function DriverList(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      {props.drives.map((drive) => (
        <DriverListCard
          key={drive.id}
          drive={drive}
        />
      ))}
    </div>
  );
}

export default DriverList;