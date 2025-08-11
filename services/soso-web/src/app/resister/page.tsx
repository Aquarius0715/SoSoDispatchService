"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Input from '../../components/TextFieald/Input';
import Button from '../../components/Button/Button';
import { useRouter } from 'next/navigation';
import Radio from '@/src/components/Button/RadioButton';
import Dropdown from '@/src/components/DropdownMenu/DropdownMenu';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [mailAddress, setMailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [hasCar, setHasCar] = useState(true);
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(false); // ローディング状態を追加

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const validateForm = () => {
  // ユーザー名: 3-30文字、英数字とアンダースコアのみ
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    alert('ユーザー名は3-30文字で、英数字とアンダースコアのみ使用可能です');
    return false;
  }
  
  // パスワード: 8-72文字
  if (password.length < 8 || password.length > 72) {
    alert('パスワードは8-72文字で入力してください');
    return false;
  }
  
  // メールアドレス
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(mailAddress)) {
    alert('有効なメールアドレスを入力してください');
    return false;
  }
  
  // 車を持っている場合、capacityは1以上
  if (hasCar && capacity <= 0) {
    alert('車を所有する場合、乗車可能人数を1以上で設定してください');
    return false;
  }
  
  return true;
};

  useEffect(() => {
    const fetchCsrfToken = async () => {
        const response = await fetch(`${API_BASE}/auth/csrf`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Registration failed`);
        }
        
        const csrfToken = Cookies.get(`csrf_token`)?.toString ?? ""
        setCsrfToken(csrfToken);
    };
    
    fetchCsrfToken();
  }, [API_BASE]);

  const register = async () => {
    if (!validateForm()) return;
  

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          username,
          mailAddress,
          password,
          hasCar: hasCar,
          capacity: hasCar ? capacity : 0, // 車がない場合は0
        }),
      });

       if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Registration failed`);
    }
      const data = await response.json();
      console.log('登録成功:', data);
      alert('登録成功');
      router.push('../');
    } catch (err: any) {
      console.error('登録失敗:', err);
      alert('登録失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const capacityOptions = [1, 2, 3, 4, 5, 6, 7, 8];
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
              type='password'
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
            {onClose => (
              capacityOptions.map(num => (
                <div 
                  key={num} 
                  className="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer text-center" 
                  onClick={() => {
                    setCapacity(num);
                    onClose(); // ★ ここで親から受け取ったonClose関数を呼び出す
                  }}
                >
                  {num}人
                </div>
              ))
            )}
            </Dropdown>
        </div>
        <Button
          onClick={register}
          className={`bg-gray-600 hover:bg-gray-700 text-white w-full max-w-md flex justify-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              登録中...
            </div>
          ) : (
            '登録'
          )}
        </Button>
        </div>
      </div>
    </div>
  )
}