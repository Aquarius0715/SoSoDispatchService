"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Input from '../components/TextFieald/Input';
import Button from '../components/Button/Button';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie"

export default function Home() {
  const router = useRouter();
  const [mailAddress, setMailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // 【追加】ページ読み込み時にlocalStorageからトークンを復元するuseEffect
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      console.log('localStorageからトークンを復元しました:', storedToken);
    }
  }, []); // 空の配列[]を指定することで、最初の1回だけ実行される
useEffect(() => {
  const fetchCsrfToken = async () => {
    console.log('CSRFトークン取得開始...');
    const res = await fetch(`${API_BASE}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });

    console.log('status:', res.status);
    console.log('content-type:', res.headers.get('content-type'));

    const raw = await res.text(); // まずは text で読む
    console.log('raw body:', raw);

    if (!res.ok) {
      throw new Error(`HTTPエラー: ${res.status} ${raw}`);
    }

    if (raw) {
      try {
        const data = JSON.parse(raw);
        setCsrfToken(data.csrf_token);
        console.log('取得したCSRFトークン(JSON):', data.csrf_token);
        // 必要なら Cookies.set('csrf_token', data.csrf_token);
      } catch (e) {
        console.warn('JSONとしてパースできません:', e);
      }
    } else {
      console.warn('ボディが空です。Cookie方式の可能性があります。');
    }
  };

  fetchCsrfToken();
}, [API_BASE]);




  const login = async () => {
    console.log('ログイン処理開始...');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          mailAddress,
          password,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();
      setToken(data.access_token);
      // 【変更点】取得したトークンをlocalStorageに保存
      localStorage.setItem('access_token', data.access_token); 

      console.log('✅ ログイン成功');
      console.log('取得したトークン:', data.access_token);
      console.log('csrfToken:', csrfToken);
      alert('ログイン成功');
      router.push('/calendarList');
    } catch (err: any) {
      console.error('❌ ログイン失敗:', err.message);
      alert('ログイン失敗: ' + err.message);
    }
  };

  

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
          <Button
            onClick={login}
            className="bg-gray-600 hover:bg-gray-700 text-white w-full max-w-md flex justify-center"
          >
            ログイン
          </Button>
          <Button
              onClick={() => router.push('/resister')}
              className="bg-gray-400 hover:bg-gray-500 text-white w-full max-w-md flex justify-center"
            >
              新規登録
            </Button>
        </div>
      </div>
    </div>
  );
}