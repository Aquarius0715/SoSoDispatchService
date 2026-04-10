/**
 * 日付を日本語ロケールでフォーマット（年月日・曜日）
 */
export function fmtJstDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
}

/**
 * 時刻を日本語ロケールでフォーマット（24時間表記）
 */
export function fmtJstTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
