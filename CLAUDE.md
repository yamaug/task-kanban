# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`task-kanban` という名前の Next.js (App Router) プロジェクト。`create-next-app` で生成された直後の状態で、まだカンバン機能自体は実装されていない（`src/app/page.tsx` はデフォルトのスターターページのまま）。

## よく使うコマンド

```bash
npm run dev        # 開発サーバーを起動 (http://localhost:3000)
npm run build       # 本番ビルド
npm run start        # 本番ビルドしたアプリを起動
npm run lint        # ESLint を実行
npm run test        # Vitest でテストを一度だけ実行
npm run test:watch  # Vitest をウォッチモードで実行
```

単一のテストファイルのみ実行する場合:

```bash
npx vitest run src/app/page.test.tsx
```

## アーキテクチャ

- **Next.js 16 / React 19 の App Router** 構成。ルーティングとページは `src/app/` 配下に置く（`src/app/page.tsx` がトップページ、`src/app/layout.tsx` がルートレイアウト）。
- パスエイリアス `@/*` は `src/*` を指す（`tsconfig.json` の `paths` 設定）。
- スタイリングは Tailwind CSS v4（`@tailwindcss/postcss` 経由、`globals.css` で読み込み）。ダークモードは `dark:` クラスで対応。
- フォントは `next/font/google` の Geist / Geist Mono を `layout.tsx` で読み込み、CSS 変数として body に適用している。

## テスト

- テストランナーは **Vitest**（Jest ではない）。環境は `jsdom`、`vitest.setup.ts` で `@testing-library/jest-dom/vitest` をセットアップ済み。
- `vitest.config.ts` で `vite-tsconfig-paths` を使っているため、テストコード内でも `@/*` エイリアスが使える。
- `globals: true` が設定されているので、テストファイルで `describe`/`it`/`expect` を import せずに使うこともできる（既存テストでは明示的に import している）。
- コンポーネントのテストは `@testing-library/react` を使い、対象コンポーネントと同じディレクトリに `*.test.tsx` として置く（例: `src/app/page.test.tsx`）。

## コーディングルール

- 変更後は必ず'npm test'でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約

- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール

- 網羅性：正常系・異常系・境界値を検討してください
- 可読性：テスト名に条件と期待する結果を明示してください
- 保守性：実装内部構造ではなくユーザーから見た振る舞いをテストしてください
- 独立性：テスト間で状態を共有しないでください
- 状態遷移：画面遷移の順方向・逆方向を検証してください
- モック方針：外部依存のみモック化してください

## 禁止事項

- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を利用しないでください

## MCP活用ルール

- Next.js・Supabase・Vitestなどの最新試用はContext7 MCPを使って公式ドキュメントを確認してください。

## Supabase接続設定

- 環境変数は `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を使用する。キー名は `.env.example` を参照し、実際の値は `.env.local` に記載する（`.env*` は `.gitignore` 対象のためコミットされない）。
- Supabaseクライアントは `src/lib/supabase.ts` がエクスポートする `supabase`（`@supabase/supabase-js` の `createClient` で生成）を利用する。環境変数が未設定の場合は import 時に例外を投げる。
- サーバー起動時の接続確認は `src/instrumentation.ts` の `register()` で行う（Next.js の Instrumentation 機能。`process.env.NEXT_RUNTIME === "nodejs"` の場合のみ実行され、Edge runtime では何もしない）。GoTrue のヘルスチェックエンドポイント（`${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`）へ fetch し、環境変数未設定・レスポンス異常・例外の場合のみ `console.error` でログ出力する。正常時はログを出力しない（禁止事項の「console.logを本番コードに残さない」方針に合わせたもの）。
- Supabase プロジェクトの情報確認（プロジェクトID・URL・APIキーなど）は Supabase MCP（`mcp__supabase__*` ツール）を使う。これは `.env.local` を読むのではなく、MCPサーバー自身が保持する認証情報でSupabaseの管理APIに直接アクセスする別経路であることに注意する。
- テーブル作成などスキーマ変更を行う場合は、まず `mcp__supabase__list_tables` で既存構造を確認してから `mcp__supabase__apply_migration` でマイグレーションを適用する。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
