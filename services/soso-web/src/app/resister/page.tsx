"use client";

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Input from '../../components/TextFieald/Input';
import Button from '../../components/Button/Button';
import { useRouter } from 'next/navigation';
import Radio from '@/src/components/Button/RadioButton';
import Dropdown from '@/src/components/DropdownMenu/DropdownMenu';

export default function RegisterPage() {
  const router = useRouter(); // ★ この行を追加
  const [username, setUsername] = useState('')
  const [mailAddress, setMailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [hasCar, setHasCar] = useState(true);
  const [capacity, setCapacity] = useState(4);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  useEffect(() => {
    // const fetchCsrfToken = async () => {
    //   try {
    //     const res = await axios.get(`${API_BASE}/auth/csrf`, {
    //       withCredentials: true
    //     })
    //     setCsrfToken(res.data.csrf_token)
    //   } catch (err: any) {
    //     console.error('CSRFトークン取得失敗', err)
    //   }
    // }

    // fetchCsrfToken()
  }, [API_BASE])

  const register = async () => {
    try {
    //   await axios.post(`${API_BASE}/users/register`, {
    //     username,
    //     mailAddress,
    //     password,
    //     hasCar: hasCar,
    //     capacity: capacity
    //   }, {
    //     headers: { 'X-CSRF-Token': csrfToken },
    //     withCredentials: true
    //   })
      alert('登録成功')
      router.push('../');
    } catch (err: any) {
      alert('登録失敗: ' + err.response?.data?.message)
    }
  }

  const capacityOptions = [1, 2, 3, 4, 5, 6, 7, 8]
  const dropdownTrigger = (
    <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white flex justify-between items-center cursor-pointer !h-11">
        {capacity}人
      <span className="text-gray-700">▼</span>
    </div>
  );
  return (
    <div className="p-4 bg-white items-center flex flex-col justify-center min-h-screen">
      <div className="flex justify-center items-center gap-x-3">
        <Image
          src="/icons/soso_icon.svg"
          alt="SoSo Logo"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold text-gray-800">配車管理サービスSOSo</h1>
      </div>
      <div className="bg-gray-200 p-6 rounded-lg mt-6 border border-gray-300 w-full max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <Input
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md" 
            />
          </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            車の有無
        </label>
        <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
            <Radio
                checked={hasCar}
                onChange={() => setHasCar(true)}
            />
            <span className="ml-2">あり</span>
            </label>
            <label className="flex items-center cursor-pointer">
            <Radio
                checked={!hasCar}
                onChange={() => setHasCar(false)}
            />
            <span className="ml-2">なし</span>
            </label>
        </div>
        <div className=" items-center space-x-6 w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                最大乗車可能人数（運転手を除く）
            </label>
            <Dropdown
                trigger={dropdownTrigger}
                className="w-full max-w-md">
                {capacityOptions.map(num => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center"
                  // 選択肢がクリックされたらcapacityの状態を更新
                  onClick={() => setCapacity(num)}
                >
                  {num}人
                </div>
              ))}
            </Dropdown>
        </div>
        <Button
          onClick={register}
          className="bg-gray-600 hover:bg-gray-700 text-white w-full max-w-md flex justify-center"
        >
        登録
        </Button>
        </div>
      </div>
    </div>
  )
}