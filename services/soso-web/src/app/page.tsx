"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Input from '../components/TextFieald/Input';
import Button from '../components/Button/Button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [mailAddress, setMailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/csrf`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCsrfToken(data.csrf_token);
        console.log('CSRFトークン取得成功:', data.csrf_token);
      } catch (err: any) {
        console.error('CSRFトークン取得失敗', err);
      }
    };

    fetchCsrfToken();
  }, [API_BASE]);

  const register = async () => {
    if (!username || !mailAddress || !password) {
      alert('すべての項目を入力してください');
      return;
    }

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
          hasCar: true,
          capacity: 4
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('登録成功:', data);
      alert('登録成功');
      router.push('/resister');
    } catch (err: any) {
      console.error('登録失敗:', err);
      alert('登録失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!mailAddress || !password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          mailAddress,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.access_token);
      console.log('ログイン成功:', data);
      alert('ログイン成功');
      router.push('/calendarList');
    } catch (err: any) {
      console.error('ログイン失敗:', err);
      alert('ログイン失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMe = async () => {
    if (!token) {
      alert('先にログインしてください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user info');
      }

      const data = await response.json();
      setUserInfo(data);
      console.log('ユーザー情報取得成功:', data);
    } catch (err: any) {
      console.error('取得失敗:', err);
      alert('取得失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    alert('ステータス編集ボタンがクリックされました！');
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
              ユーザー名
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md"
              placeholder="ユーザー名を入力"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <Input
              type="email"
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md"
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!h-11 !rounded-md bg-white w-full max-w-md"
              placeholder="パスワードを入力"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={login}
              className="bg-gray-600 hover:bg-gray-700 text-white w-full max-w-md flex justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
            
            <Button
              onClick={register}
              className="bg-gray-400 hover:bg-gray-500 text-white w-full max-w-md flex justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '登録中...' : '新規登録'}
            </Button>
            
            <Button
              onClick={getMe}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full max-w-md flex justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '取得中...' : 'ユーザー情報取得'}
            </Button>
          </div>
        </div>
      </div>

      {/* ユーザー情報表示エリア */}
      {userInfo && (
        <div className="mt-6 border p-4 bg-gray-100 rounded-lg w-full max-w-md">
          <h2 className="font-bold text-gray-800 mb-2">ユーザー情報</h2>
          <div className="text-sm text-gray-600">
            <p><strong>ユーザー名:</strong> {userInfo.username}</p>
            <p><strong>メールアドレス:</strong> {userInfo.mailAddress}</p>
            <p><strong>車の所有:</strong> {userInfo.hasCar ? 'あり' : 'なし'}</p>
            {userInfo.hasCar && (
              <p><strong>定員:</strong> {userInfo.capacity}人</p>
            )}
            <p><strong>SOSOポイント:</strong> {userInfo.sosoPoint || 0}pt</p>
          </div>
        </div>
      )}

      {/* CSRFトークン表示（開発用） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500">
          CSRF Token: {csrfToken ? '取得済み' : '未取得'}
        </div>
      )}
    </div>
  );
}