# modern-web-stack

Node.js、TypeScript、React を使って学習できる、最小構成のフルスタック Web アプリ開発環境です。`pnpm workspace` によるモノレポ構成で、フロントエンド・バックエンド・共有パッケージをまとめて管理します。

## 1. プロジェクト概要

- フロントエンド: React + Vite + TypeScript
- バックエンド: Fastify + TypeScript + Drizzle ORM
- DB: PostgreSQL (Docker Compose で起動)
- 共通定義: `packages/shared` に Zod スキーマと型を集約
- サンプル機能: ユーザー管理 CRUD

## 2. 技術スタック

### フロントエンド

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zod
- Vitest
- React Testing Library
- ESLint
- Prettier

### バックエンド

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod
- Vitest
- ESLint
- Prettier
- tsx

### 共通

- pnpm workspace
- Docker Compose
- ESM
- strict TypeScript

## 3. 必要なソフトウェア

- Node.js
- pnpm
- Docker / Docker Compose

## 4. Node.js および pnpm の推奨バージョン

- Node.js: 26.x
- pnpm: 11.x

## 5. セットアップ手順

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## 6. `.env` 作成方法

```bash
cp .env.example .env
```

`.env.example` には以下の主要設定が含まれています。

```env
BACKEND_PORT=3001
FRONTEND_PORT=3000
CORS_ORIGIN=http://localhost:3000
POSTGRES_USER=app
POSTGRES_PASSWORD=app_password
POSTGRES_DB=app
POSTGRES_PORT=5432
DATABASE_URL=postgres://app:app_password@localhost:5432/app
VITE_API_BASE_URL=/api
```

## 7. PostgreSQL 起動方法

```bash
pnpm db:up
```

停止する場合:

```bash
pnpm db:down
```

## 8. マイグレーション方法

生成:

```bash
pnpm db:generate
```

実行:

```bash
pnpm db:migrate
```

## 9. seed 実行方法

```bash
pnpm db:seed
```

## 10. 開発サーバー起動方法

```bash
pnpm dev
```

個別起動も可能です。

```bash
pnpm dev:frontend
pnpm dev:backend
```

起動後の URL:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

## 11. テスト方法

### 通常テスト

単体テスト・コンポーネントテスト・モックを使用した API テストを実行します。PostgreSQL は起動しません。

```bash
pnpm test
```

個別実行:

```bash
pnpm --filter @modern-web-stack/backend test
pnpm --filter @modern-web-stack/frontend test
```

### バックエンド統合テスト

実際の PostgreSQL を使用して、ユーザー CRUD API の HTTP レスポンスと DB への永続化内容を検証します。

```bash
pnpm --filter @modern-web-stack/backend test:integration
```

このコマンドは以下を自動で行います。

1. テスト専用の `test-db` を起動し、ヘルスチェック完了を待機する
2. `apps/backend/.env.test` の接続先（`localhost:5433/test_app`）へマイグレーションを実行する
3. `apps/backend/src/integration/` の統合テストを実行する
4. 成否にかかわらず `test-db` とテスト専用ボリュームを停止・削除する

`test-db` は開発用の `db` とは、ポート・データベース名・Docker ボリュームを分離しています。そのため、統合テストは開発用 DB（`localhost:5432/app`）のデータを変更しません。

## 12. lint / format / typecheck 方法

```bash
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
```

## 13. ディレクトリ構成

```text
modern-web-stack/
├── apps/
│   ├── backend/
│   │   ├── drizzle/
│   │   ├── src/
│   │   │   ├── db/            # DB クライアント・スキーマ・マイグレーション
│   │   │   ├── domain/        # ドメインモデル（User クラス）
│   │   │   ├── repositories/  # DB アクセス層
│   │   │   ├── routes/        # ルート定義・入力バリデーション
│   │   │   ├── services/      # アプリケーションサービス（オーケストレーション）
│   │   │   ├── errors.ts      # ドメインエラー定義
│   │   │   ├── app.ts         # Fastify アプリ生成・エラーハンドラー
│   │   │   └── server.ts      # エントリーポイント
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── pages/
│       │   ├── routes/
│       │   ├── schemas/
│       │   ├── App.tsx
│       │   └── main.tsx
├── packages/
│   └── shared/
│       └── src/               # Zod スキーマ・共通型定義
├── compose.yaml
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
└── .env.example
```

## 14. バックエンドのレイヤー構成

バックエンドは以下の 4 層で構成されています。

```
Route → Service → Repository → DB
         ↕
       Domain
```

### Domain（`src/domain/`）

ビジネスルールを保持するドメインモデル層です。

- `User` クラスが以下の責務を担います
  - `User.create(props)` : バリデーションを行いながら新しい `User` インスタンスを生成
  - `User.reconstruct(props)` : DB などの信頼できるデータから `User` を復元（バリデーション不要）
  - `changeName(name)` / `changeEmail(email)` : 名前・メールアドレスの変更（ドメインルールを通過）
- 名前は 1〜50 文字・前後の空白除去、メールは有効な形式・小文字正規化というルールをここで保持します
- ルート定義や Repository にビジネスロジックを記述しません

### Service（`src/services/`）

アプリケーションロジックを担うオーケストレーション層です。

- ドメインオブジェクトの生成と Repository 呼び出しのみ行います
- 重複メールチェック（`DuplicateEmailError`）や存在チェック（`UserNotFoundError`）もここで行います
- DB の詳細には依存せず、`UserRepository` インターフェース経由でアクセスします

### Repository（`src/repositories/`）

DB アクセスのみを担当する永続化層です。

- `UserRepository` インターフェースが定義するメソッド: `findAll`, `findById`, `findByEmail`, `insert`, `update`, `delete`
- Drizzle ORM を使って PostgreSQL へアクセスします
- ビジネス判断はここに書きません。DB の結果をドメインオブジェクトに変換して返します

### Route（`src/routes/`）

HTTP リクエストの受付と Zod による入力バリデーションを担当します。

- Zod スキーマで `request.body` / `request.params` を検証し、失敗時は `ValidationError` を投げます
- バリデーション済みの入力を Service に渡すだけで、ビジネスロジックは持ちません

## 15. Validation の流れ

```
クライアント
    │
    │ HTTP Request
    ▼
Route層 (routes/users.ts)
    │ Zodスキーマ (createUserInputSchema / updateUserInputSchema) で検証
    │ 失敗 → ValidationError (400)
    ▼
Service層 (services/user-service.ts)
    │ 重複メール確認
    │ 重複あり → DuplicateEmailError (409)
    ▼
Domain層 (domain/user.ts)
    │ User.create() でドメインルールを検証
    │ 失敗 → ValidationError (400)
    ▼
Repository層 (repositories/user-repository.ts)
    │ DBアクセス
    ▼
PostgreSQL
```

### エラーとHTTPステータスの対応

| エラークラス          | HTTP ステータス | 説明                         |
| --------------------- | --------------- | ---------------------------- |
| `ValidationError`     | 400             | 入力値の形式・制約違反       |
| `DuplicateEmailError` | 409             | 登録済みのメールアドレス     |
| `UserNotFoundError`   | 404             | 対象ユーザーが存在しない     |

## 16. API 一覧

- `GET /api/health`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### レスポンス例

#### Health check

```json
{
  "status": "ok"
}
```

#### User list

```json
{
  "data": [
    {
      "id": "user-1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 17. 学習上のポイント

- `createApp` と `server.ts` を分離し、Fastify `inject` でテストしやすい構成にしています。
- ドメイン層に業務ルール（バリデーション・名前変更・メール変更）を集約し、Route や Repository に書きません。
- Service 層でドメインオブジェクト生成・Repository 呼び出し・重複チェックのみを行います。
- Repository は DB アクセスのみ担当し、`UserRepository` インターフェースで依存を逆転させています。
- ドメインエラー（`ValidationError` / `DuplicateEmailError` / `UserNotFoundError`）を Fastify エラーハンドラーで適切な HTTP ステータスに変換します。
- フロントエンドは TanStack Query で一覧取得・再取得を管理しています。
- API 入出力は Zod で検証し、フロントとバックで共通スキーマを再利用しています。
- Vite の `/api` proxy を使うため、開発中はフロントから相対パスで API を呼び出せます。
