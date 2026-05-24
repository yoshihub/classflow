# ClassFlow Mini システム設計資料

## この資料の目的

ClassFlow Mini を今後開発していくために、システムの目的・業務フロー・画面設計・テーブル設計・API設計・実装順序を整理した資料です。

ClassFlow Mini は、**小規模教室向けの欠席・振替管理SaaS**です。

最初から教室管理の全機能を作るのではなく、以下に絞ります。

- 生徒管理
- クラス管理
- レッスン管理
- 欠席登録
- 振替チケット発行
- 振替予約
- 出欠登録
- 未消化振替一覧

## 想定する技術スタック

| 項目 | 技術 |
|---|---|
| フロントエンド | Next.js / TypeScript |
| UI | Tailwind CSS / shadcn/ui |
| BFF | Next.js Route Handler |
| バックエンド | Laravel |
| DB | MySQL |
| 認証 | Laravel Sanctum |
| 開発環境 | Docker / Docker Compose |

## 資料一覧

| ファイル | 内容 |
|---|---|
| `01_overview.md` | システム概要・目的・対象ユーザー |
| `02_business_flow.md` | 教室運営上の業務フロー |
| `03_user_operation_flow.md` | 画面上でユーザーが操作する流れ |
| `04_screen_design.md` | 画面一覧・画面ごとの役割 |
| `05_database_design.md` | テーブル設計・カラム案 |
| `06_er_diagram.md` | ER図・テーブル同士の関係 |
| `07_api_design.md` | Laravel API / Next.js BFF 設計 |
| `08_auth_and_roles.md` | 認証・権限設計 |
| `09_mvp_scope.md` | MVPスコープ・後回しにする機能 |
| `10_development_plan.md` | 実装順序・開発ロードマップ |

## 最初の開発方針

最初のMVPでは、保護者が直接ログインする機能は作りません。

まずは、**先生・教室管理者が管理画面で欠席・振替を手入力するシステム**として作ります。

その理由は、以下の通りです。

- 実装範囲を小さくできる
- 業務フローを理解しやすい
- Laravel / Next.js / BFF / CRUD / 認証 / DB設計の練習になる
- 将来的に保護者フォームやLINE連携へ拡張しやすい

## ClassFlow Mini の中心概念

このシステムで一番重要なのは、以下の流れです。

```text
欠席する
↓
振替チケットが発行される
↓
別日のレッスンに振替予約する
↓
振替で出席したらチケットが消化される
```

この流れをシステムで正確に管理できることが、ClassFlow Miniの価値です。
