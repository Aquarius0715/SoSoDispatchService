"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Input from '../components/TextFieald/Input';
import Button from '../components/Button/Button';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie"

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [mailAddress, setMailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

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
          credentials: 'include'
        });
        if (!res.ok) {
          throw new Error(`HTTPエラー: ${res.status}`);
        }
        const csrfToken = Cookies.get(`csrf_token`)?.toString() ?? ""
        setCsrfToken(csrfToken);
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
      alert('ログイン成功');
      router.push('/calendarList');
    } catch (err: any) {
      console.error('❌ ログイン失敗:', err.message);
      alert('ログイン失敗: ' + err.message);
    }
  };

  const getMe = async () => {
    console.log('ユーザー情報取得開始...');
    console.log('使用トークン:', token);
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        headers: {
          // 'token'はuseStateから取得するため、localStorageから復元されていれば値が入っている
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();
      setUserInfo(data);
      console.log('✅ ユーザー情報取得成功:', data);
      alert('取得成功');
    } catch (err: any) {
      console.error('❌ ユーザー情報取得失敗:', err.message);
      alert('取得失敗: ' + err.message);
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