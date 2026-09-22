# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`task-kanban` という名前の Next.js (App Router) プロジェクト。Supabase をバックエンドにしたタスク管理カンバンの基本機能（一覧表示・追加・編集・削除、ドラッグ&ドロップでのステータス変更）を実装済み。`src/app/page.tsx` は宇宙ステーション風のスプラッシュページ（`/board` への導線）、カンバン本体は `/board`（`src/app/board/page.tsx`）にある。UI は shadcn/ui ベースで「宇宙ステーションのHUD」をイメージしたダーク固定デザインに統一済み（詳細は「shadcn/ui」「デザインルール」セクション参照）。

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
- スタイリングは Tailwind CSS v4（`@tailwindcss/postcss` 経由、`globals.css` で読み込み）＋ shadcn/ui。ダークモードは `dark:` クラス（`.dark` セレクタ）で対応。
- フォントは `next/font/google` の Geist / Geist Mono を `layout.tsx` で読み込み、`--font-geist-sans`/`--font-geist-mono` という CSS 変数として body に適用している。`globals.css` の `@theme inline` 内の `--font-sans`/`--font-heading` はこれらの変数を参照する形にしてあるため、shadcn CLI で `globals.css` が再生成された場合はこのマッピングが壊れていないか確認すること（`--font-sans: var(--font-sans)` のような自己参照になっていたら誤り）。

## カンバン機能のアーキテクチャ

- 型定義: `src/types/task.ts` に `Task`（`id`/`title`/`description`/`status`/`createdAt`/`updatedAt`）、`TaskStatus`（`"todo" | "in_progress" | "done"`）、`TASK_STATUSES`、`TASK_STATUS_LABELS`（日本語ラベル）を定義。
- データアクセス層: `src/lib/tasks.ts` が Supabase の `tasks` テーブルに対する CRUD（`fetchTasks`/`createTask`/`updateTask`/`deleteTask`）を提供する。DB の `snake_case`（`created_at` 等）と型の `camelCase`（`createdAt` 等）の変換は `mapRowToTask` で行う。エラー時は Supabase の `error.message` を使って `throw new Error(...)` する。
- コンポーネント構成（`src/components/`）:
  - `TaskBoard.tsx`: ページの状態管理を一手に担うコンテナ。`tasks`/`isLoading`/`errorMessage`/`isAddFormOpen`/`editingTask` を state で持ち、CRUD 関数を呼んで結果をローカル state に反映する。ドラッグ&ドロップは `@dnd-kit/core` の `DndContext` を使い、`createOnDragEnd`（テスト用に export されたファクトリ関数）でハンドラを生成する。
  - `TaskColumn.tsx`: ステータスごとの列。`useDroppable` でドロップ先になる。
  - `TaskCard.tsx`: 個々のタスクカード。`useDraggable` でドラッグ可能。削除は確認ステップ（`isConfirmingDelete`）を挟む。
  - `TaskForm.tsx`: 追加・編集共通のフォーム。`initialTask` の有無で追加/編集を切り替え、タイトル必須のバリデーションをする。
- 一覧への即時反映の方針: 追加・編集・削除・ドラッグ操作はいずれも Supabase 呼び出し後の戻り値でローカル state を直接更新する（再フェッチしない）。失敗時は変更前の state に戻し、`errorMessage` をセットしてユーザーに通知する（楽観的更新＋ロールバック）。新規機能を追加する際もこのパターンを踏襲すること。

## shadcn/ui

- `npx shadcn@latest init -d`（Nova プリセット）で導入済み。設定は `components.json` を参照（`style: "base-nova"`、`baseColor: "neutral"`、`cssVariables: true`、`iconLibrary: "lucide"`）。
- コンポーネント追加は `npx shadcn@latest add <component>` を使う（例: `npx shadcn@latest add dialog`）。生成先は `src/components/ui/`。
- `cn` ユーティリティは `src/lib/utils.ts` が `cn` パッケージ（`class-variance-authority` と組み合わせて使う想定）から re-export したものを使う。クラス名の結合には独自実装せずこれを使うこと。
- テーマ変数（色・角丸など）は `globals.css` の `:root`/`.dark` に OKLCH 値で定義され、`@theme inline` で Tailwind のユーティリティ（`bg-background`/`text-foreground` 等）にマッピングされている。色を変更する場合はこの CSS 変数側を編集し、コンポーネント個別に色をハードコードしないこと。
- shadcn/ui・Tailwind の最新仕様は Context7 MCP（ライブラリ ID: `/websites/ui_shadcn`）で確認すること（MCP活用ルールに準拠）。
- このプロジェクトの `Button`（`src/components/ui/button.tsx`）は Radix ではなく **`@base-ui/react/button`** ベース。Radix の `asChild` は存在しないため、他要素（`next/link` の `Link` 等）をボタン風に見せたい場合は次のいずれかを使うこと。
  - リンクなど別要素として振る舞わせたいだけなら `buttonVariants({ variant, size, className })` を `import { buttonVariants } from "@/components/ui/button"` して対象要素の `className` に渡す（`src/app/page.tsx` の CTA リンクを参照）。
  - `Button` 自体を別要素としてレンダリングしたい場合は `render={<Link href="...">...</Link>}` のように `render` prop に要素を渡す（base-ui の共通パターン。`Badge`/`Separator` など他の base-ui 系コンポーネントも同様）。ボタンの中身は `Button` の children ではなく `render` に渡す要素の children に書くこと。`<button>` 以外を描画する場合は `nativeButton={false}` を明示しないと開発時に警告が出るが、ネイティブなリンクとして振る舞わせたい（`role="link"` を維持したい）場合は `buttonVariants` 方式を優先し、`nativeButton={false}` で `role="button"` を上書きしないこと。

## デザインルール

宇宙ステーションのHUD（ヘッドアップディスプレイ）をイメージした、ダーク固定・エッジのきいたデザインで統一している。新規UIを追加・変更する際もこのトーンを踏襲すること。

- **ダーク固定**：ライト/ダーク切り替えは実装しない（`next-themes` は導入しない）。`src/app/layout.tsx` の `<html>` に `className="dark"` を明示しており、`globals.css` の `:root` と `.dark` には同じ配色を持たせている（`.dark` クラスの有無に関わらず同じ見た目になる）。
- **配色トークン**（`src/app/globals.css` の `:root`/`.dark`、OKLCH値）：
  - `--background`/`--card`/`--popover` は深宇宙を思わせる紺〜黒系、`--foreground` は冷たい白。
  - `--primary`/`--ring` はエレクトリックシアン（主要アクセント）。
  - `--chart-1`＝アンバー（未着手 `todo`）、`--chart-2`＝シアン（進行中 `in_progress`）、`--chart-3`＝エメラルド（完了 `done`）。ステータスに紐づく色を追加する場合はこの3色を流用し、`TaskColumn.tsx` の `STATUS_ACCENT` のようなステータス→色のマッピングを1箇所にまとめること。
  - `--destructive` は警報レッド/オレンジ。破壊的操作（削除確定など）には `Button`/`Badge`/`Alert` の `variant="destructive"` を使う。
  - 色を追加・変更する場合は必ずこれらの CSS 変数側を編集し、コンポーネント側で色をハードコード（`bg-red-600` 等の直書き）しないこと。
- **角丸**：`--radius: 0.3rem` とシャープ寄りに設定している。デフォルトの shadcn/ui コンポーネントが持つ角丸ユーティリティ（`rounded-*`）をそのまま使えば自動的にこの値に追従するため、個別コンポーネントで丸みを強める（`rounded-full`/`rounded-2xl` 等）のは特別な理由がない限り避けること。
- **HUD装飾ユーティリティ**（`globals.css` の `@layer utilities` に定義。テキスト内容に影響しないため既存テストへの影響はない）：
  - `.bg-starfield`：背景の星々の点描。ページ全体の背景（`main`/トップページの外枠）に使う。
  - `.bg-hud-grid`：薄いグリッド線。パネルやページ背景に控えめに重ねる（`opacity-*` で不透明度を下げて使う）。
  - `.glow-primary`/`.glow-ring`：シアン系のグロー。フォーカス時・ドラッグ中・強調したいCTAなど「今アクティブなもの」を示す用途に限定して使い、常時多用しない。
  - `.text-glow`：見出し等に使う軽いテキストシャドウ。
- **shadcn/uiコンポーネントの使い分け**：生の `<div>`/`<input>`/`<button>` 等を新たに書かず、既存導入済みの `Card`/`Input`/`Textarea`/`Label`/`Badge`/`Alert`/`Skeleton`/`Separator`/`Button`（`src/components/ui/`）を優先して使う。未導入のコンポーネントが必要な場合は `npx shadcn@latest add <component>` で追加する（「shadcn/ui」セクション参照）。
  - フォーム系の validation エラーやユーザー向けエラーメッセージは `Alert variant="destructive"` + `AlertDescription` を使う（`role="alert"` が自動付与される）。
  - ローディング状態はテキスト（例:「読み込み中...」）を残したまま `Skeleton` を併用し、テキストのみ・`Skeleton` のみのどちらか一方に倒さない。
- **アイコン**：`lucide-react` を使う（`components.json` の `iconLibrary: "lucide"` に準拠）。装飾目的のアイコンは `aria-hidden` が自動で付く（lucide-react のデフォルト挙動）ため追加対応不要だが、アイコンのみのボタン（テキストなし）にする場合は必ず `aria-label` で意味の分かる文言を付けること。
- **既存テストとの整合**：デザインを変更しても構わないが、以下は崩さないこと（詳細は「テスト」セクションのテストファイルを参照）。
  - ボタン・ラベル・見出し・ステータス名・エラー文言などの日本語テキストとその対応関係（`<label htmlFor>`/`id`、ボタンの accessible name）。
  - カウントバッジの数値はプレーンテキストとして描画する（`aria-label` のみに逃さない）。
  - ドラッグ&ドロップの `useDroppable`/`useDraggable` の `id` とドラッグハンドル要素（`aria-label="ドラッグして移動"`）の構造。
  - 見た目の変更（クラス名・DOM構造・装飾）自体はテストで縛られていないため自由に調整してよい。

## テスト

- テストランナーは **Vitest**（Jest ではない）。環境は `jsdom`、`vitest.setup.ts` で `@testing-library/jest-dom/vitest` をセットアップ済み。
- `vitest.config.ts` で `vite-tsconfig-paths` を使っているため、テストコード内でも `@/*` エイリアスが使える。
- `globals: true` が設定されているので、テストファイルで `describe`/`it`/`expect` を import せずに使うこともできる（既存テストでは明示的に import している）。
- コンポーネントのテストは `@testing-library/react` を使い、対象コンポーネントと同じディレクトリに `*.test.tsx` として置く（例: `src/app/page.test.tsx`）。
- Supabase をモックする際は `src/lib/tasks.test.ts` のパターンに従う: `vi.mock("@/lib/supabase", () => ({ supabase: { from: vi.fn() } }))` とし、`select`/`order`/`insert`/`update`/`delete`/`eq`/`single` を自身を返す `vi.fn()` として持ち、かつ `then` を実装した thenable なクエリビルダーのモック（`createQueryBuilder`）を `supabase.from` の戻り値にする。実際の Supabase JS クライアントの呼び出しチェーンを模倣することで、成功・エラー両方のレスポンスをテストできる。
- コンポーネントのテストでは `src/lib/tasks.ts` 自体を `vi.mock("@/lib/tasks", () => ({ fetchTasks: vi.fn(), createTask: vi.fn(), ... }))` としてモックし、Supabase の詳細には立ち入らない（モック方針「外部依存のみモック化」の実践例）。
- ドラッグ&ドロップ（`@dnd-kit/core`）のロジックは `TaskBoard.test.tsx` のように、DOM 操作ではなく `createOnDragEnd` が返すハンドラ関数を直接呼び出してテストする（`buildActive`/`buildOver`/`buildDragEndEvent` のようなヘルパーで `DragEndEvent` を組み立てる）。

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

## DB スキーマ（tasks テーブル）

- `mcp__supabase__apply_migration` で作成済み（マイグレーション: `create_tasks_table`, `fix_set_updated_at_search_path`）。スキーマ変更時は既存マイグレーションを壊さないよう、新しいマイグレーションを追加する形で行う。
- カラム: `id uuid default gen_random_uuid() primary key`／`title text not null`／`description text null`／`status text not null default 'todo'`（`CHECK (status = ANY (ARRAY['todo','in_progress','done']))`）／`created_at timestamptz default now()`／`updated_at timestamptz default now()`。
- `status` の取りうる値は `src/types/task.ts` の `TaskStatus`/`TASK_STATUSES` と一致させること（片方だけ変更しない）。
- RLS は有効。`anon` ロールに対して `SELECT`/`INSERT`/`UPDATE`/`DELETE` を全許可するポリシー（`anon_select_tasks` 等、`qual`/`with_check` は `true`）を設定済み。認証機能はまだ無いため、ユーザーごとのアクセス制御は入っていない（将来的に認証を導入する場合はここを見直すこと）。
- スキーマや RLS ポリシーを変更した場合は `mcp__supabase__get_advisors`（`type: "security"`）でセキュリティ警告が出ていないか確認する。

## 既知の問題（devDependencies のバージョン競合）

- `vitest@3.2.7`（要求: `vite` `^5||^6||^7`）と `@vitejs/plugin-react@6.1.1`（要求: `vite` `^8`）の peer 依存が競合し、`vite` が2バージョン（7.x と 8.x）共存インストールされる。このため `vitest.config.ts` を素直に `tsc` で型チェックすると `Plugin` 型の不一致でエラーになる（`npm run build` の TypeScript チェック工程で顕在化する。テスト実行自体や `npm run dev` には影響しない）。
- 対処として `tsconfig.json` の `exclude` に `vitest.config.ts` を追加し、Next のビルド時型チェック対象から外している。Vitest はこの `tsconfig.json` の `include`/`exclude` に関係なく独自のトランスフォームで動くため、テストは通常通り実行できる。
- 将来的に `vitest`（4系以降）や `@vitejs/plugin-react` を更新して `vite` のバージョンを一本化できれば、この `exclude` は不要になる可能性がある。依存関係を更新する際はこの制約を踏まえること。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
