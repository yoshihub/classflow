# 08. 認証・権限設計

## 認証方針

ClassFlow Mini では、Laravel Sanctum を使って認証します。

MVPでは、APIトークン認証を想定します。

```text
ログイン
↓
LaravelがSanctumトークンを発行
↓
Next.js側でトークンを保持
↓
BFF経由でLaravel APIへアクセス
```

---

## ユーザー種別

MVPでのユーザー種別は以下です。

| 種別 | 説明 |
|---|---|
| admin | 教室管理者 |
| teacher | 講師 |

最初は `admin` のみでも問題ありません。

ただし、DB設計上は `role` を持たせ、後から講師権限を追加しやすくします。

---

## admin ができること

教室管理者はすべての機能を操作できます。

- 生徒管理
- 保護者管理
- クラス管理
- レッスン管理
- 欠席登録
- 振替予約
- 出欠登録
- 未消化振替確認
- お知らせ管理

---

## teacher ができること

講師は、自分の担当クラスに関する操作に制限する想定です。

将来的には以下に制限します。

- 担当クラスのレッスン閲覧
- 担当クラスの出欠登録
- 担当クラスの欠席確認

MVPでは、teacher権限の細かい制御は後回しでOKです。

---

## company_id によるデータ分離

ClassFlow MiniはSaaS想定なので、複数の教室が同じシステムを使う可能性があります。

そのため、ほぼすべての業務テーブルに `company_id` を持たせます。

例：

```text
students.company_id
classes.company_id
lessons.company_id
absence_requests.company_id
makeup_tickets.company_id
```

ログインユーザーの `company_id` と一致するデータだけを操作できるようにします。

---

## 重要なルール

### リクエストから company_id を信用しない

APIリクエストで `company_id` を受け取らないようにします。

悪い例：

```json
{
  "company_id": 2,
  "name": "山田花子"
}
```

良い例：

```json
{
  "name": "山田花子"
}
```

`company_id` はログインユーザーから取得します。

```php
$companyId = $request->user()->company_id;
```

---

## 認証が必要なAPI

以下の業務APIはすべて認証必須です。

- 生徒API
- クラスAPI
- レッスンAPI
- 出欠API
- 欠席API
- 振替API
- お知らせAPI

Laravelでは `auth:sanctum` を付けます。

例：

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/students', [StudentController::class, 'index']);
});
```

---

## ログインAPI

### POST /api/login

入力：

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

処理：

1. メールアドレスでユーザーを検索
2. パスワードを確認
3. 正しければSanctumトークンを発行
4. トークンとユーザー情報を返す

---

## ログアウトAPI

### POST /api/logout

処理：

1. 認証中のユーザーを取得
2. 現在のトークンを削除
3. ログアウト成功レスポンスを返す

---

## me API

### GET /api/me

ログイン中のユーザー情報を返します。

レスポンス例：

```json
{
  "id": 1,
  "company_id": 1,
  "name": "管理者",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

## セキュリティ上の注意

### 他教室データの閲覧防止

常に `company_id` で絞り込みます。

例：

```php
Student::where('company_id', $request->user()->company_id)->get();
```

### ID指定時も company_id を見る

悪い例：

```php
Student::findOrFail($id);
```

良い例：

```php
Student::where('company_id', $request->user()->company_id)
    ->findOrFail($id);
```

### トークンの扱い

MVPではシンプルにトークン認証で進めます。

本番運用では、以下の検討が必要です。

- Cookie認証
- HTTPS
- CSRF対策
- トークン有効期限
- ログアウト時のトークン削除
