"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Member, Reservation } from "../types";
import { api } from "../lib/api/client";

type CalendarReservationState = {
  reservations: Reservation[];
  members: Member[];
  selected: Reservation | null;
  loading: boolean;
  error: string | null;
};

type CalendarReservationActions = {
  loadInitialData: (name: string) => Promise<void>;
  createReservation: (
    name: string,
    input: Omit<Reservation, "id">
  ) => Promise<Reservation>;
  updateReservation: (
    name: string,
    id: string,
    patch: Partial<Reservation>
  ) => Promise<Reservation>;
  deleteReservation: (name: string, id: string) => Promise<void>;
  select: (reservation: Reservation | null) => void;
};

type CalendarReservationContextType = CalendarReservationState & CalendarReservationActions;

const CalendarReservationContext = createContext<CalendarReservationContextType | undefined>(undefined);

type ProviderProps = {
  name: string;
  children: React.ReactNode;
};

export function CalendarReservationProvider({ name, children }: ProviderProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async (n: string) => {
    setLoading(true);
    setError(null);
    try {
      const [r, m] = await Promise.all([
        api.listReservations(n),
        api.listMembers(n),
      ]);
      setReservations(r);
      setMembers(m);
    } catch (e) {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(
    async (n: string, input: Omit<Reservation, "id">) => {
      const created = await api.createReservation(n, input);
      setReservations((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateReservation = useCallback(
    async (n: string, id: string, patch: Partial<Reservation>) => {
      const updated = await api.updateReservation(n, id, patch);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    []
  );

  const deleteReservation = useCallback(
    async (n: string, id: string) => {
      await api.deleteReservation(n, id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setSelected((s) => (s?.id === id ? null : s));
    },
    []
  );

  const select = useCallback((reservation: Reservation | null) => setSelected(reservation), []);

  useEffect(() => {
    // 初期ロード
    loadInitialData(name);
    // name が変わった時も再ロード
  }, [name, loadInitialData]);

  const value = useMemo<CalendarReservationContextType>(
    () => ({ reservations, members, selected, loading, error, loadInitialData, createReservation, updateReservation, deleteReservation, select }),
    [reservations, members, selected, loading, error, loadInitialData, createReservation, updateReservation, deleteReservation, select]
  );

  return (
    <CalendarReservationContext.Provider value={value}>{children}</CalendarReservationContext.Provider>
  );
}

export function useCalendarReservation(): CalendarReservationContextType {
  const ctx = useContext(CalendarReservationContext);
  if (!ctx) {
    throw new Error("useCalendarReservation must be used within CalendarReservationProvider");
  }
  return ctx;
}


