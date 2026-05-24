# 07. API設計

## 基本方針

ClassFlow Mini は以下の構成で作ります。

```text
ブラウザ
↓
Next.js Route Handler（BFF）
↓
Laravel API
↓
MySQL
```

ブラウザからLaravel APIを直接叩かず、Next.jsのBFFを挟みます。

これにより、フロントエンド側の処理を整理しやすくなります。

---

## URL構成

### Next.js

```text
http://localhost:3000
```

### Laravel API

```text
http://localhost:8080/api
```

---

## 認証API

### ログイン

```http
POST /api/login
```

#### リクエスト例

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

#### レスポンス例

```json
{
  "token": "plain-text-token",
  "user": {
    "id": 1,
    "name": "管理者",
    "email": "admin@example.com"
  }
}
```

---

### ログアウト

```http
POST /api/logout
```

認証済みユーザーの現在のトークンを削除します。

---

### ログインユーザー取得

```http
GET /api/me
```

認証済みユーザー情報を返します。

---

## 生徒API

### 生徒一覧

```http
GET /api/students
```

#### クエリ例

```text
?keyword=山田&page=1
```

### 生徒登録

```http
POST /api/students
```

#### リクエスト例

```json
{
  "name": "山田花子",
  "kana": "やまだはなこ",
  "status": "active",
  "memo": "母親への連絡希望",
  "guardian": {
    "name": "山田太郎",
    "phone": "090-xxxx-xxxx",
    "email": "parent@example.com",
    "relationship": "father"
  }
}
```

### 生徒詳細

```http
GET /api/students/{id}
```

### 生徒更新

```http
PUT /api/students/{id}
```

### 生徒削除

```http
DELETE /api/students/{id}
```

MVPでは物理削除ではなく、ステータスを `withdrawn` にする運用でも良いです。

---

## クラスAPI

### クラス一覧

```http
GET /api/classes
```

### クラス登録

```http
POST /api/classes
```

#### リクエスト例

```json
{
  "name": "キッズダンス初級",
  "weekday": 2,
  "start_time": "17:00",
  "end_time": "18:00",
  "capacity": 12,
  "teacher_id": 2,
  "level": "初級"
}
```

### クラス詳細

```http
GET /api/classes/{id}
```

### クラス更新

```http
PUT /api/classes/{id}
```

### クラス削除

```http
DELETE /api/classes/{id}
```

---

## クラス所属API

### 生徒をクラスに追加

```http
POST /api/classes/{classId}/students
```

#### リクエスト例

```json
{
  "student_id": 1,
  "joined_at": "2026-06-01"
}
```

### 生徒をクラスから外す

```http
DELETE /api/classes/{classId}/students/{studentId}
```

---

## レッスンAPI

### レッスン一覧

```http
GET /api/lessons
```

#### クエリ例

```text
?date_from=2026-06-01&date_to=2026-06-30
```

### レッスン登録

```http
POST /api/lessons
```

#### リクエスト例

```json
{
  "class_id": 1,
  "lesson_date": "2026-06-09",
  "start_time": "17:00",
  "end_time": "18:00",
  "capacity": 12,
  "teacher_id": 2
}
```

### レッスン詳細

```http
GET /api/lessons/{id}
```

### レッスン更新

```http
PUT /api/lessons/{id}
```

---

## 出欠API

### レッスンの出欠一覧

```http
GET /api/lessons/{id}/attendances
```

### 出欠登録・更新

```http
POST /api/lessons/{id}/attendances
```

#### リクエスト例

```json
{
  "attendances": [
    {
      "student_id": 1,
      "status": "present"
    },
    {
      "student_id": 2,
      "status": "absent"
    }
  ]
}
```

---

## 欠席API

### 欠席登録

```http
POST /api/absence-requests
```

#### リクエスト例

```json
{
  "student_id": 1,
  "lesson_id": 10,
  "reason": "体調不良",
  "memo": "6月中に振替希望"
}
```

#### 処理内容

- absence_requests に登録
- makeup_tickets を1件発行
- 必要に応じて attendances に欠席情報を反映

### 欠席一覧

```http
GET /api/absence-requests
```

---

## 振替チケットAPI

### 未消化振替一覧

```http
GET /api/makeup-tickets
```

#### クエリ例

```text
?status=unused
```

### 生徒ごとの振替チケット一覧

```http
GET /api/students/{id}/makeup-tickets
```

---

## 振替予約API

### 振替候補レッスン一覧

```http
GET /api/makeup-candidate-lessons
```

#### クエリ例

```text
?student_id=1&makeup_ticket_id=5
```

### 振替予約

```http
POST /api/makeup-reservations
```

#### リクエスト例

```json
{
  "makeup_ticket_id": 5,
  "target_lesson_id": 20
}
```

#### 処理内容

- target_lesson_id の空き枠を確認
- makeup_reservations を作成
- makeup_tickets.status を `reserved` に変更

### 振替予約キャンセル

```http
PUT /api/makeup-reservations/{id}/cancel
```

#### 処理内容

- makeup_reservations.status を `cancelled` に変更
- makeup_tickets.status を `unused` に戻す

---

## お知らせAPI

MVPでは送信機能までは作らず、送信履歴の登録だけでも構いません。

### お知らせ一覧

```http
GET /api/messages
```

### お知らせ作成

```http
POST /api/messages
```

---

## BFF Route 設計例

Next.js側では、以下のようなBFF Routeを作ります。

| BFF Route | Laravel API |
|---|---|
| `/api/bff/login` | `POST /api/login` |
| `/api/bff/me` | `GET /api/me` |
| `/api/bff/students` | `GET /api/students` |
| `/api/bff/classes` | `GET /api/classes` |
| `/api/bff/lessons` | `GET /api/lessons` |
| `/api/bff/absence-requests` | `POST /api/absence-requests` |
| `/api/bff/makeup-tickets` | `GET /api/makeup-tickets` |
| `/api/bff/makeup-reservations` | `POST /api/makeup-reservations` |

---

## API設計の注意点

### company_id はリクエストで受け取らない

`company_id` はログインユーザーから取得します。

ユーザーに `company_id` を送らせると、他教室のデータにアクセスできる危険があります。

### 認証必須にする

基本的に、業務APIはすべて `auth:sanctum` を付けます。

### バリデーションを必ず行う

Laravelの Form Request を使い、以下をチェックします。

- 必須項目
- 日付形式
- 定員超過
- 同じチケットの二重予約
- 他教室データへのアクセス
