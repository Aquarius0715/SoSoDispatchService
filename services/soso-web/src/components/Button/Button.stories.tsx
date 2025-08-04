import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { FaUserPlus } from 'react-icons/fa';

// メタデータ: コンポーネントに関する情報を定義
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

// デフォルトのボタン
export const Default: Story = {
  args: {
    children: 'Default Button',
    className: 'bg-red-500 hover:bg-blue-600',
  },
};

// アイコン付きのボタン
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <FaUserPlus className="mr-2" />
        Add User
      </>
    ),
    className: 'bg-green-500 hover:bg-green-600',
  },
};

// 小さなボタン
export const Small: Story = {
  args: {
    children: 'Small Button',
    className: 'bg-red-500 hover:bg-red-600 px-2 py-1 text-sm',
  },
};