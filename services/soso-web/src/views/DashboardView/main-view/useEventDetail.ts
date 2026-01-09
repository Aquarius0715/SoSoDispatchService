import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { EventDetails } from '@/types/interfaces';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const useEventDetail = (eventData: EventDetails | null) => {
  const [seatsRequired, setSeatsRequired] = useState<number | ''>('');
  const [dropOffRemaining, setDropOffRemaining] = useState(0);
  const [pickUpRemaining, setPickUpRemaining] = useState(0);
  const [registered, setRegistered] = useState<string[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userDropOffRegistered, setUserDropOffRegistered] = useState(false);
  const [userPickUpRegistered, setUserPickUpRegistered] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);

  // 認証ヘッダー
  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token') ?? '';
    const csrf = Cookies.get('XSRF-TOKEN') ?? '';
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (csrf) headers['X-CSRF-Token'] = csrf;
    return headers;
  };

  // API 1: 配車登録状況の取得
  const fetchDispatchRegistrations = async () => {
    if (!eventData?.id) return;
    
    try {
      setIsLoadingRegistrations(true);
      const response = await fetch(`${API_BASE}/events/${eventData.id}/detail`, {
        headers: authHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const details = await response.json();
        setDetailData(details);

        if (typeof details.remainingReturnSeats === 'number') setDropOffRemaining(details.remainingReturnSeats);
        if (typeof details.remainingGoSeats === 'number') setPickUpRemaining(details.remainingGoSeats);

        const regs = Array.isArray(details.participants) ? details.participants : [];
        setRegistered(regs);
        
        // 簡易実装: ここで「自分が登録済みか」の判定が必要
        // 現状のコードベースに合わせて、一旦リセットあるいはAPIの仕様に合わせて実装してください
        // setUserDropOffRegistered(...); 
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // API 2: 自分のキャパシティ取得
  const fetchUserCapacity = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const cap = parseInt(data.capacity || data.cap || data.capacity_number, 10);
        if (!isNaN(cap)) setSeatsRequired(cap);
      }
    } catch (e) { /* ignore */ }
  };

  // API 3: 登録アクション
  const handleRegister = async (type: 'dropOff' | 'pickUp') => {
    if (!eventData?.id) return;
    setIsRegistering(true);
    
    try {
      const endpoint = type === 'dropOff' 
        ? `${API_BASE}/events/${eventData.id}/return`
        : `${API_BASE}/events/${eventData.id}/pickup`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      await fetchDispatchRegistrations();
      
      if (type === 'dropOff') {
        setUserDropOffRegistered(true);
        alert('送り登録完了');
      } else {
        setUserPickUpRegistered(true);
        alert('迎え登録完了');
      }
    } catch (error) {
      alert(`登録失敗: ${error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // 初期化エフェクト
  useEffect(() => {
    if (eventData) {
      setDropOffRemaining(eventData.dropOffCount);
      setPickUpRemaining(eventData.pickUpCount);
      // リセット
      setDetailData(null);
      setUserDropOffRegistered(false);
      setUserPickUpRegistered(false);
      
      fetchDispatchRegistrations();
      fetchUserCapacity();
    }
  }, [eventData?.id]);

  return {
    detailData,
    seatsRequired,
    dropOffRemaining,
    pickUpRemaining,
    registered,
    isLoadingRegistrations,
    isRegistering,
    userDropOffRegistered,
    userPickUpRegistered,
    onRegister: handleRegister,
  };
};