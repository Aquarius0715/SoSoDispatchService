import type { Meta, StoryObj } from '@storybook/react';
import DriverListCard from './DriverListCard';
// 親コンポーネントから型定義をインポートします
import { DriveState } from './DriverList';

// 1. ストーリーの基本情報を設定
const meta = {
  title: 'Components/DriverListCard', // Storybookのサイドバーでの表示名
  component: DriverListCard,
  tags: ['autodocs'],
} satisfies Meta<typeof DriverListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. 「迎え」の場合のストーリーを作成
export const PickUp: Story = {
  args: { // このストーリーでコンポーネントに渡すデータ
    drive: {
      id: 1,
      calenderName: '定期イベントA',
      eventName: '会場への移動',
      driveState: DriveState.PICK_UP,
      eventDate: '2025/08/10',
      driveTime: '09:00',
      passengerNumber: 4,
    },
  },
};

// 3. 「送り」の場合のストーリーを作成
export const DropOff: Story = {
  args: {
    drive: {
      id: 2,
      calenderName: '定期イベントA',
      eventName: '会場からの解散',
      driveState: DriveState.DROP_OFF,
      eventDate: '2025/08/10',
      driveTime: '17:30',
      passengerNumber: 4,
    },
  },
};