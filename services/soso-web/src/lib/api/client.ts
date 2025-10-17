import { Reservation, Member } from "../../types";

// モックデータ（簡易）
let mockReservations: Reservation[] = [
  {
    id: "1",
    title: "テスト予約",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    members: [],
    details: "MVP用のサンプル",
  },
];

let mockMembers: Member[] = [
  { id: "m1", memberName: "Alice", hasCar: false },
  { id: "m2", memberName: "Bob", hasCar: true, passengerNumber: 3 },
];

export const api = {
  listReservations: async (name: string): Promise<Reservation[]> => {
    console.log("[mock] listReservations", { name });
    // 名前単位の分離は今は行わない（MVP）
    return Promise.resolve([...mockReservations]);
  },
  listMembers: async (name: string): Promise<Member[]> => {
    console.log("[mock] listMembers", { name });
    return Promise.resolve([...mockMembers]);
  },
  createReservation: async (
    name: string,
    input: Omit<Reservation, "id">
  ): Promise<Reservation> => {
    console.log("[mock] createReservation", { name, input });
    const created: Reservation = { id: String(Date.now()), ...input };
    mockReservations = [created, ...mockReservations];
    return Promise.resolve(created);
  },
  updateReservation: async (
    name: string,
    id: string,
    patch: Partial<Reservation>
  ): Promise<Reservation> => {
    console.log("[mock] updateReservation", { name, id, patch });
    let updated: Reservation | undefined;
    mockReservations = mockReservations.map((r) => {
      if (r.id === id) {
        updated = { ...r, ...patch };
        return updated;
      }
      return r;
    });
    if (!updated) {
      // 存在しない場合は新規に近い形で返す（MVPの簡略）
      updated = { id, title: patch.title ?? "", start: patch.start ?? "", end: patch.end ?? "", members: patch.members ?? [] };
      mockReservations = [updated, ...mockReservations];
    }
    return Promise.resolve(updated);
  },
  deleteReservation: async (name: string, id: string): Promise<void> => {
    console.log("[mock] deleteReservation", { name, id });
    mockReservations = mockReservations.filter((r) => r.id !== id);
    return Promise.resolve();
  },
};


