# `event_participants` 設計案（送り/迎え/参加者/ドライバー）

## 目的
1人のユーザーが「参加者」かつ「ドライバー（行き/帰り/両方）」や「同乗者（行き/帰り）」になれるケースを、DB上で破綻なく表現する。

現状のように `type` を1カラムで表し、`PRIMARY KEY(event_id, user_id)` のままだと、同一ユーザーを複数役割で持てず（PK衝突）、結果として「参加者かつドライバー/同乗者」が表現しづらい。

## 方針（設計の要点）
- `event_participants` は **1行 = `event_id` × `user_id`**（同一イベント内でユーザーは最大1行）
- 役割は `type` で表さず、以下5つの boolean 属性（`t/f`）で表す
  - `go_driver_status`
  - `return_driver_status`
  - `go_rider_status`
  - `return_rider_status`
  - `participants_status`
- `true=有効`, `false=無効/未登録` とする

## テーブル案（カラムイメージ）
※ 実際のDDLは移行方針に合わせて調整する（例: 既存 `status/type` の置き換え）。

| 列 | 型の例 | 意味 |
|---|---|---|
| `event_id` | VARCHAR(36) | イベントID |
| `user_id` | VARCHAR(36) | ユーザーID |
| `participants_status` | BOOLEAN | 参加者として有効か（`true/false`） |
| `go_driver_status` | BOOLEAN | 行きドライバーとして有効か（`true/false`） |
| `return_driver_status` | BOOLEAN | 帰りドライバーとして有効か（`true/false`） |
| `go_rider_status` | BOOLEAN | 行き同乗者として有効か（`true/false`） |
| `return_rider_status` | BOOLEAN | 帰り同乗者として有効か（`true/false`） |
| `created_at` / `updated_at` | DATETIME(6) | 通常の監査列 |

### 主キー
- 最低限：`PRIMARY KEY (event_id, user_id)` を維持する（1ユーザー1行を担保する）

## 状態の定義（boolean）
- `participants_status = true`：参加者として有効
- `go_driver_status = true`：行きドライバーとして有効
- `return_driver_status = true`：帰りドライバーとして有効
- `go_rider_status = true`：行き同乗者として有効
- `return_rider_status = true`：帰り同乗者として有効
- 各列の `false` は「その役割として無効/未登録」

## 表で表現（1行でできること）
`participants_status` = 「イベント自体に参加するか」（送迎だけの人は `false`）。
各役割は独立した boolean なので **1行で複数の役割を同時に表現**できる：

| ケース | participants_status | go_driver_status | return_driver_status | go_rider_status | return_rider_status |
|---|---|---|---|---|---|
| 参加者のみ（送り迎え不要） | `true` | `false` | `false` | `false` | `false` |
| 参加＋行きドライバー | `true` | `true` | `false` | `false` | `false` |
| 参加＋帰りドライバー | `true` | `false` | `true` | `false` | `false` |
| 参加＋両方ドライバー | `true` | `true` | `true` | `false` | `false` |
| 参加＋行き同乗 | `true` | `false` | `false` | `true` | `false` |
| 参加＋帰り同乗 | `true` | `false` | `false` | `false` | `true` |
| 参加＋行き帰り同乗 | `true` | `false` | `false` | `true` | `true` |
| 送迎だけ（行きドライバー） | `false` | `true` | `false` | `false` | `false` |
| 送迎だけ（帰りドライバー） | `false` | `false` | `true` | `false` | `false` |
| 送迎だけ（両方ドライバー） | `false` | `true` | `true` | `false` | `false` |

## API/取得クエリへの影響（絞り込み条件）
- 参加者一覧（event detail の `participants`）
  - `participants_status = true`
- 行きドライバー一覧（`goDrivers`）
  - `go_driver_status = true`
- 帰りドライバー一覧（`returnDrivers`）
  - `return_driver_status = true`
- 行き同乗者一覧（`goRiders`）
  - `go_rider_status = true`
- 帰り同乗者一覧（`returnRiders`）
  - `return_rider_status = true`
- 残席計算（`seats_required_go` / `seats_required_return` と容量合計）
  - 行き：`go_driver_status = true` のユーザー容量合計
  - 帰り：`return_driver_status = true` のユーザー容量合計

## 変更の要点（実装の方針）
- `type` カラムは廃止（または移行しきるまで読み替え）
- 登録は INSERT ではなく、基本的に **(event_id,user_id) を UPSERT/UPDATE** して該当 boolean 列だけ更新する

