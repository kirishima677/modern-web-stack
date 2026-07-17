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

- Node.js: 24.x (LTS)
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

```bash
pnpm test
```

個別実行:

```bash
pnpm --filter @modern-web-stack/backend test
pnpm --filter @modern-web-stack/frontend test
```

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
│   │   │   ├── db/
│   │   │   ├── plugins/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── app.ts
│   │   │   └── server.ts
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
│       └── src/
├── compose.yaml
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
└── .env.example
```

## 14. API 一覧

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

## 15. 学習上のポイント

- `createApp` と `server.ts` を分離し、Fastify `inject` でテストしやすい構成にしています。
- バックエンドはサービス層を分け、DB 依存をルート定義から切り離しています。
- フロントエンドは TanStack Query で一覧取得・再取得を管理しています。
- API 入出力は Zod で検証し、フロントとバックで共通スキーマを再利用しています。
- Vite の `/api` proxy を使うため、開発中はフロントから相対パスで API を呼び出せます。
