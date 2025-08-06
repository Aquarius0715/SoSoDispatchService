"use client";

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Input from '../components/TextFieald/Input';
import Button from '../components/Button/Button';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter(); // ★ この行を追加
  const [username, setUsername] = useState('')
  const [mailAddress, setMailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

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
      await axios.post(`${API_BASE}/users/register`, {
        username,
        mailAddress,
        password,
        hasCar: true,
        capacity: 4
      }, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true
      })
      alert('登録成功')
      router.push('/resister');
    } catch (err: any) {
      alert('登録失敗: ' + err.response?.data?.message)
    }
  }

  const login = async () => {
    try {
      // const res = await axios.post(`${API_BASE}/auth/login`, {
      //   mailAddress,
      //   password
      // }, {
      //   headers: { 'X-CSRF-Token': csrfToken },
      //   withCredentials: true
      // })
      // setToken(res.data.access_token)
      router.push('/mypage');
      alert('ログイン成功')
      
    } catch (err: any) {
      alert('ログイン失敗: ' + err.response?.data?.message)
    }
  }

  const getMe = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      })
      setUserInfo(res.data)
    } catch (err: any) {
      alert('取得失敗: ' + err.response?.data?.message)
    }
  }

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
            onClick={register}
            className="bg-gray-400 hover:bg-gray-500 text-white w-full max-w-md flex justify-center"
          >
            新規登録
          </Button>
        </div>
      </div>
    </div>
    
  )
}
 // <div className="p-4 max-w-md mx-auto space-y-4">

      
    //   <h1 className="text-xl font-bold">ユーザー登録 & ログイン</h1>

    //   <input
    //     type="text"
    //     placeholder="ユーザー名"
    //     className="w-full p-2 border"
    //     value={username}
    //     onChange={(e) => setUsername(e.target.value)}
    //   />
    //   <input
    //     type="text"
    //     placeholder="メールアドレス"
    //     className="w-full p-2 border"
    //     value={mailAddress}
    //     onChange={(e) => setMailAddress(e.target.value)}
    //   />
    //   <input
    //     type="password"
    //     placeholder="パスワード"
    //     className="w-full p-2 border"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <div className="flex space-x-2">
    //     <button onClick={register} className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
    //     <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">ログイン</button>
    //     <button onClick={getMe} className="bg-gray-500 text-white px-4 py-2 rounded">ユーザー情報</button>
    //   </div>

    //   {userInfo && (
    //     <div className="mt-4 border p-4 bg-gray-100">
    //       <h2 className="font-bold">ユーザー情報</h2>
    //       <pre>{JSON.stringify(userInfo, null, 2)}</pre>
    //     </div>
    //   )}
    // </div> 