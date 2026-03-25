# `event_participants` 設計案（送り/迎え/参加者/ドライバー）

## 目的
1人のユーザーが「参加者」かつ「ドライバー（行き/帰り/両方）」になれるケースを、DB上で破綻なく表現する。

現状のように `type` を1カラムで表し、`PRIMARY KEY(event_id, user_id)` のままだと、同一ユーザーを `participants` と `go/return` の両方で表せず（PK衝突）、結果として「参加者かつドライバー」が表現できない。

## 方針（設計の要点）
- `event_participants` は **1行 = `event_id` × `user_id`**（同一イベント内でユーザーは最大1行）
- 役割は `type` で表さず、**役割別の status 列（またはフラグ）**で表す
- 未登録（そもそもその役割をしていない）は `NULL`
- キャンセルした（登録したが無効にした）は `ENUM('registered','cancelled')` の `cancelled`

## テーブル案（カラムイメージ）
※ 実際のDDLは移行方針に合わせて調整する（例: 既存 `status/type` の置き換え）。

| 列 | 型の例 | 意味 |
|---|---|---|
| `event_id` | VARCHAR(36) | イベントID |
| `user_id` | VARCHAR(36) | ユーザーID |
| `participant_status` | ENUM('registered','cancelled') 或いは `NULL` | 参加者として登録/キャンセル済み |
| `go_driver_status` | ENUM('registered','cancelled') 或いは `NULL` | 行きドライバーとして登録/キャンセル済み |
| `return_driver_status` | ENUM('registered','cancelled') 或いは `NULL` | 帰りドライバーとして登録/キャンセル済み |
| `participant_registered_at` | DATETIME(6) 或いは共有 | 参加者登録時刻（任意） |
| `go_driver_registered_at` | DATETIME(6) 或いは共有 | 行きドライバー登録時刻（任意） |
| `return_driver_registered_at` | DATETIME(6) 或いは共有 | 帰りドライバー登録時刻（任意） |
| `created_at` / `updated_at` | DATETIME(6) | 通常の監査列 |

### 主キー
- 最低限：`PRIMARY KEY (event_id, user_id)` を維持する（1ユーザー1行を担保する）

## 状態の定義（NULL の意味）
- `go_driver_status IS NULL`：未登録（行きドライバーとして参加していない）
- `go_driver_status='registered'`：行きドライバーとして有効
- `go_driver_status='cancelled'`：行きドライバーとしてキャンセル済み
- `return_driver_status` も同様
- `participant_status` も同様（「参加者として登録していない」は `NULL`）

## 表で表現（1行でできること）
「参加者かつドライバー」が **2行ではなく1行**で表現できる例：

| ケース | participant_status | go_driver_status | return_driver_status |
|---|---|---|---|
| 参加者のみ | `registered` | `NULL` | `NULL` |
| 行きドライバーのみ（迎え担当） | `registered` | `registered` | `NULL` |
| 帰りドライバーのみ（送り担当） | `registered` | `NULL` | `registered` |
| 両方ドライバー（行きも帰りも担当） | `registered` | `registered` | `registered` |

キャンセル例（履歴を残すなら `cancelled` を入れる）：

| ケース | participant_status | go_driver_status | return_driver_status |
|---|---|---|---|
| 行きだけキャンセル（帰りは継続） | `registered` | `cancelled` | `registered` |

## API/取得クエリへの影響（絞り込み条件）
- 参加者一覧（event detail の `participants`）
  - `participant_status='registered'`（または必要に応じて `!= 'cancelled'` など）
- 行きドライバー一覧（`goDrivers`）
  - `go_driver_status='registered'`
- 帰りドライバー一覧（`returnDrivers`）
  - `return_driver_status='registered'`
- 残席計算（`seats_required_go` / `seats_required_return` と容量合計）
  - 行き：`go_driver_status='registered'` のユーザー容量合計
  - 帰り：`return_driver_status='registered'` のユーザー容量合計

## 変更の要点（実装の方針）
- `type` カラムは廃止（または移行しきるまで読み替え）
- 登録は INSERT ではなく、基本的に **(event_id,user_id) を UPSERT/UPDATE** して該当 status 列だけ更新する

