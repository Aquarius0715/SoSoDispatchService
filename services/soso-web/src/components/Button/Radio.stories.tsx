import type { Meta, StoryObj } from '@storybook/react';
import Radio from './RadioButton';
import React, { useState } from 'react';

// Radioコンポーネントのpropsの型を定義
type RadioProps = React.ComponentProps<typeof Radio>;

// ラジオボタンの制御を扱うラッパーコンポーネント
const ControlledRadio = (args: RadioProps) => {
  const [selected, setSelected] = useState(args.value);
  return (
    <Radio
      {...args}
      checked={selected === args.value}
      onChange={() => setSelected(args.value)}
    />
  );
};

// メタデータ: コンポーネントに関する情報を定義
const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: { action: 'changed' },
    onClick: { action: 'clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof Radio>;

// ラベルなしのラジオボタン
export const NoLabel: Story = {
  render: (args) => <ControlledRadio {...args} />,
  args: {
    value: 'optionA',
    checked: true, // 最初のデフォルト状態
  },
};

// ラベル付きのラジオボタン
export const WithLabel: Story = {
  render: (args) => <ControlledRadio {...args} />,
  args: {
    children: 'Option A',
    value: 'optionA',
    checked: true, // 最初のデフォルト状態
  },
};

// 複数のラジオボタン
export const MultipleRadios = {
  render: () => {
    const [selected, setSelected] = useState('optionA');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSelected(e.target.value);

    return (
      <div className="flex flex-col space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="multiple-radios"
            value="optionA"
            checked={selected === 'optionA'}
            onChange={handleChange}
            className="mr-2"
          />
          Option A
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="multiple-radios"
            value="optionB"
            checked={selected === 'optionB'}
            onChange={handleChange}
            className="mr-2"
          />
          Option B
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="multiple-radios"
            value="optionC"
            checked={selected === 'optionC'}
            onChange={handleChange}
            className="mr-2"
          />
          Option C
        </label>
      </div>
    );
  },
};