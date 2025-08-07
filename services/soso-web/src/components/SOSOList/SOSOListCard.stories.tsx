import type { Meta, StoryObj } from '@storybook/react';
import SOSOcard from './SOSOListCard';

// Storybookの基本設定
const meta = {
  title: 'Components/SOSOcard',
  component: SOSOcard,
  tags: ['autodocs'],
} satisfies Meta<typeof SOSOcard>;

export default meta;

type Story = StoryObj<typeof meta>;

// 1. ポイント付与（プラス）のストーリー
export const PointAdded: Story = {
  args: {
    dateTime: '2024/04/10 22:30',
    changer: '山田次郎',
    changee: '鈴木三郎',
    sosoPoints: 1,
    reason: 'カラオケで大声で歌いすぎた',
  },
};

// 2. ポイント減算（マイナス）のストーリー
export const PointDeducted: Story = {
  args: {
    dateTime: '2024/04/15 22:00',
    changer: '佐藤花子',
    changee: '田中太郎',
    sosoPoints: -1,
    reason: 'みんなの分のタクシーを手配してくれた',
  },
};

// 3. ポイント変動なし（ゼロ）のストーリー
export const NoChange: Story = {
  args: {
    dateTime: '2024/04/20 23:00',
    changer: '管理者',
    changee: '全員',
    sosoPoints: 0,
    reason: '定期メンテナンス',
  },
};