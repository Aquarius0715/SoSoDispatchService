import type { Meta, StoryObj } from '@storybook/react';
import SOSOList from './SOSOList';
import { SOSOTransaction } from './SOSOList';

const meta: Meta<typeof SOSOList> = {
  title: 'Components/SOSOList',
  component: SOSOList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockLogs: SOSOTransaction[] = [
  {
    id: 1,
    eventName: '歓送迎会',
    date: '2024/04/15',
    time: '22:00',
    changer: '佐藤花子',
    changee: '田中太郎',
    sosoPoints: -1,
    reason: 'みんなの分のタクシーを手配してくれた',
  },
  {
    id: 2,
    eventName: '新歓コンパ',
    date: '2024/04/15',
    time: '21:15',
    changer: '山田次郎',
    changee: '鈴木三郎',
    sosoPoints: 2,
    reason: 'カラオケで大声で歌いすぎた',
  },
  {
    id: 3,
    eventName: '新歓コンパ',
    date: '2024/04/15',
    time: '20:30',
    changer: '田中太郎',
    changee: '佐藤花子',
    sosoPoints: 3,
    reason: 'お酒をこぼして服を汚した',
  },
  {
    id: 4,
    eventName: '歓送迎会',
    date: '2024/04/10',
    time: '23:45',
    changer: '鈴木三郎',
    changee: '山田次郎',
    sosoPoints: 1,
    reason: '二次会で道に迷って遅刻させた',
  },
];

export const Default: Story = {
  args: {
    logs: mockLogs,
  },
};

export const Empty: Story = {
  args: {
    logs: [],
  },
};