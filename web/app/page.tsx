"use client";

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/csrf`, {
          withCredentials: true
        })
        setCsrfToken(res.data.csrf_token)
      } catch (err: any) {
        console.error('CSRFトークン取得失敗', err)
      }
    }

    fetchCsrfToken()
  }, [API_BASE])

  const register = async () => {
    try {
      await axios.post(`${API_BASE}/users/register`, {
        username,
        password,
        hasCar: true,
        capacity: 4
      }, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true
      })
      alert('登録成功')
    } catch (err: any) {
      alert('登録失敗: ' + err.response?.data?.message)
    }
  }

  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password
      }, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true
      })
      setToken(res.data.access_token)
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

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">ユーザー登録 & ログイン</h1>

      <input
        type="text"
        placeholder="ユーザー名"
        className="w-full p-2 border"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        className="w-full p-2 border"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex space-x-2">
        <button onClick={register} className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
        <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">ログイン</button>
        <button onClick={getMe} className="bg-gray-500 text-white px-4 py-2 rounded">ユーザー情報</button>
      </div>

      {userInfo && (
        <div className="mt-4 border p-4 bg-gray-100">
          <h2 className="font-bold">ユーザー情報</h2>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
