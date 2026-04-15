# Development

## 前提

- Node: `^22 || ^24`
- npm（lockfile に合わせる）
- Shopify CLI（Oxygen デプロイに必要）
- `.env` に Storefront / Admin トークン類（Git には絶対コミットしない）

## セットアップ

```bash
npm install
npm run codegen   # Shopify + React Router の型生成
npm run dev       # 開発サーバー
```

## コマンド一覧

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー（codegen watch 付き） |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド + プレビュー |
| `npm run lint` | ESLint |
| `npm run typecheck` | React Router typegen + `tsc --noEmit` |
| `npm run codegen` | Shopify + React Router 型生成 |

## commit 前チェック

プロジェクトルールにより commit 前に以下を確認:

1. `npm run typecheck` が pass
2. `npm run build` が pass
3. `.env` / 秘密情報が staged にないこと（`git diff --cached` 確認）
4. 重要変更時は `npm run preview` で golden path 目視確認

## ブラウザ確認の必須ケース

以下の変更は typecheck / build だけでは検証不足。必ずローカルで実ブラウザ確認:

- ヘッダー / フッターのナビゲーション
- PDP（メタフィールド表示、Express アップグレードバー）
- カート（数量変更、チェックアウト遷移）
- モバイルメニュー / カートドロワー
- `og:image`, JSON-LD（view-source で実値を確認）

## ディレクトリ配置ルール

- 新コンポーネントは `app/components/` 直下、単一責務
- GraphQL フラグメントは `app/lib/fragments.ts` に集約
- 定数・型は `app/lib/` に置き、ルートからは import で参照
- 800 行を超えたファイルはセクション分割を検討

## コミットスタイル

```
<type>: <日本語の短い説明>

<詳細本文（任意）>
```

type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## トラブルシューティング

| 症状 | 確認先 |
|-----|-------|
| 型エラーが急に増えた | `npm run codegen` を実行したか |
| Storefront クエリが 401 | `.env` の `PUBLIC_STOREFRONT_API_TOKEN` |
| Oxygen デプロイ失敗 | PowerShell で実行しているか（Git Bash は NG のケースあり） |
| dev で画像が出ない | Shopify Admin 側で商品が ACTIVE か、画像 URL が CDN か |
