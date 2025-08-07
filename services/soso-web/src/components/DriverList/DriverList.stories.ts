// import type { Meta, StoryObj } from '@storybook/react';
// import DriverList from './DriverList';
// import { DriveState } from './DriverList'; // 型定義をインポート

// // 1. ストーリーの基本情報を設定
// const meta = {
//   title: 'Components/DriverList', // Storybookのサイドバーでの表示名
//   component: DriverList,
//   tags: ['autodocs'],
// } satisfies Meta<typeof DriverList>;

// export default meta;
// type Story = StoryObj<typeof meta>;

// // 2. 表示するサンプルデータの配列を用意
// const mockDrives = [
//   { id: 1, calenderName: '定期イベントA', eventName: '会場への移動', driveState: DriveState.PICK_UP, eventDate: '2025/08/10', driveTime: '09:00', passengerNumber: 4 },
//   { id: 2, calenderName: '練習試合B', eventName: '対外試合', driveState: DriveState.PICK_UP, eventDate: '2025/08/12', driveTime: '08:30', passengerNumber: 5 },
//   { id: 3, calenderName: '定期イベントA', eventName: '会場からの解散', driveState: DriveState.DROP_OFF, eventDate: '2025/08/10', driveTime: '17:30', passengerNumber: 4 },
// ];

// // 3. 通常のリスト表示のストーリー
// export const Default: Story = {
//   args: {
//     drives: mockDrives, // 用意したサンプルデータを渡す
//   },
// };

// // 4. データが空の場合のストーリー
// export const Empty: Story = {
//   args: {
//     drives: [], // 空の配列を渡す
//   },
// };