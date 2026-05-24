# 05. データベース設計

## 基本方針

ClassFlow Mini はSaaSとして作る想定です。

そのため、各教室のデータが混ざらないように、多くのテーブルに `company_id` を持たせます。

`company_id` は「どの教室のデータか」を表します。

---

## テーブル一覧

| テーブル | 役割 |
|---|---|
| companies | 教室・スクール情報 |
| users | 管理者・講師 |
| students | 生徒 |
| guardians | 保護者 |
| classes | 曜日・時間ごとのクラス |
| class_students | 生徒とクラスの中間テーブル |
| lessons | 実際の日付ごとのレッスン |
| attendances | 出欠情報 |
| absence_requests | 欠席登録 |
| makeup_tickets | 振替権利 |
| makeup_reservations | 振替予約 |
| messages | お知らせ送信履歴 |

---

## companies

教室・スクールを表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| name | string | 教室名 |
| email | string nullable | 教室代表メール |
| phone | string nullable | 電話番号 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

---

## users

管理者・講師を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| name | string | ユーザー名 |
| email | string | メールアドレス |
| password | string | パスワード |
| role | string | 権限 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### role の候補

| 値 | 意味 |
|---|---|
| admin | 管理者 |
| teacher | 講師 |

MVPでは `admin` だけでも構いません。

---

## students

生徒を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| name | string | 生徒名 |
| kana | string nullable | ふりがな |
| birthdate | date nullable | 生年月日 |
| status | string | 在籍状態 |
| memo | text nullable | メモ |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| active | 在籍中 |
| paused | 休会中 |
| withdrawn | 退会済み |

---

## guardians

保護者を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| student_id | bigint | 生徒ID |
| name | string | 保護者名 |
| phone | string nullable | 電話番号 |
| email | string nullable | メールアドレス |
| relationship | string nullable | 続柄 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

1人の生徒に複数の保護者を紐づけられるようにします。

---

## classes

曜日・時間ごとのクラスを表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| name | string | クラス名 |
| weekday | unsignedTinyInteger | 曜日 |
| start_time | time | 開始時間 |
| end_time | time | 終了時間 |
| capacity | unsignedInteger | 定員 |
| teacher_id | bigint nullable | 担当講師ID |
| level | string nullable | レベル |
| memo | text nullable | メモ |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### weekday の例

| 値 | 曜日 |
|---|---|
| 0 | 日曜 |
| 1 | 月曜 |
| 2 | 火曜 |
| 3 | 水曜 |
| 4 | 木曜 |
| 5 | 金曜 |
| 6 | 土曜 |

---

## class_students

生徒がどのクラスに所属しているかを表す中間テーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| class_id | bigint | クラスID |
| student_id | bigint | 生徒ID |
| joined_at | date nullable | 所属開始日 |
| left_at | date nullable | 所属終了日 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

生徒とクラスは多対多です。

---

## lessons

実際の日付ごとのレッスンを表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| class_id | bigint | クラスID |
| lesson_date | date | レッスン日 |
| start_time | time | 開始時間 |
| end_time | time | 終了時間 |
| capacity | unsignedInteger | 定員 |
| teacher_id | bigint nullable | 担当講師ID |
| status | string | 状態 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| scheduled | 予定 |
| cancelled | 休講 |
| completed | 完了 |

---

## attendances

出欠情報を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| lesson_id | bigint | レッスンID |
| student_id | bigint | 生徒ID |
| status | string | 出欠状態 |
| memo | text nullable | メモ |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| present | 出席 |
| absent | 欠席 |
| late | 遅刻 |
| makeup | 振替参加 |

---

## absence_requests

欠席登録を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| student_id | bigint | 生徒ID |
| lesson_id | bigint | 欠席対象レッスンID |
| reason | string nullable | 欠席理由 |
| memo | text nullable | メモ |
| status | string | 状態 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| registered | 登録済み |
| cancelled | キャンセル |

---

## makeup_tickets

振替権利を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| student_id | bigint | 生徒ID |
| absence_request_id | bigint | 欠席登録ID |
| original_lesson_id | bigint | 元レッスンID |
| expires_at | date | 振替期限 |
| status | string | 状態 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| unused | 未使用 |
| reserved | 予約済み |
| used | 消化済み |
| expired | 期限切れ |
| cancelled | 無効 |

---

## makeup_reservations

振替予約を表すテーブルです。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| makeup_ticket_id | bigint | 振替チケットID |
| student_id | bigint | 生徒ID |
| target_lesson_id | bigint | 振替先レッスンID |
| status | string | 状態 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### status の候補

| 値 | 意味 |
|---|---|
| reserved | 予約済み |
| attended | 出席済み |
| cancelled | キャンセル |

---

## messages

お知らせ送信履歴を表すテーブルです。

MVPでは実際の送信機能を作らず、送信履歴だけを残しても構いません。

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint | 主キー |
| company_id | bigint | 教室ID |
| title | string | 件名 |
| body | text | 本文 |
| target_type | string | 送信対象 |
| sent_at | timestamp nullable | 送信日時 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |
