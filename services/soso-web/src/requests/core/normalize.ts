// services/soso-web/src/requests/core/normalize.ts
//
// API 境界の綴り吸収レイヤ。
// バックエンド(soso-api)は "calender"(typo, er綴り)で統一されており、
// レスポンス JSON も calenderId / calenderName という er キーで返す。
// 一方フロントは "calendar"(ar綴り)で統一しているため、
// 受信時にここで一括変換して、フロント内部は ar 綴りだけで扱えるようにする。
//
// 注: 変換は「受信(レスポンス)方向」のみ。リクエストボディに er キーは無い。

/** er(API) -> ar(フロント) のキー対応表。ここに載っているキーだけを変換する。 */
const KEY_MAP: Record<string, string> = {
  calenderId: "calendarId",
  calenderName: "calendarName",
};

/**
 * オブジェクト/配列を再帰的に走査し、KEY_MAP に載っている er キーを ar キーへ付け替える。
 * KEY_MAP 外のキーや値はそのまま保持する。
 */
export function normalizeCalendarKeys<T>(input: T): T {
  // 配列: 各要素を再帰的に正規化
  if (Array.isArray(input)) {
    return input.map((item) => normalizeCalendarKeys(item)) as unknown as T;
  }

  // プリミティブ / null: そのまま返す
  if (input === null || typeof input !== "object") {
    return input;
  }

  const source = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    const normalizedValue = normalizeCalendarKeys(value);

    // er キーを ar キーへ付け替える。
    // ただし ar キーが source に既に存在する場合は、本物の ar 値を潰さないよう
    // 変換せず元の key のまま残す(API が両方返した時の保険)。
    const mappedKey = KEY_MAP[key];
    const targetKey =
      mappedKey && !Object.prototype.hasOwnProperty.call(source, mappedKey)
        ? mappedKey
        : key;
    result[targetKey] = normalizedValue;
  }

  return result as T;
}
