import clsx from 'clsx';
import React from 'react';
import Button from '../Button/Button';

interface Props {
  className?: string;
  date: Date;
  changer: string;
  changee: string;
  sosoPoints: number;
  reason: string;
}

interface Props {
  className?: string;
  calenderName?: string;
  eventName?: string;
  driveState?: DriveState;
  eventDate?: string;
  driveTime?: string;
  passengerNumber?: number;
  children?: React.ReactNode;
}