# Tokyo Spin Vault — Shopify Hydrogen Beyblade Store

日本在住セラー（NinJapon）がタカラトミー製ベイブレードを海外向けに販売する Shopify Hydrogen ストア。

**本番 URL**: https://tokyospinvault.com

## 技術スタック

- **Framework**: Shopify Hydrogen 2026.4.0 (React Router 7.12, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.2（ダークモードファースト、vault テーマ）
- **Animation**: Framer Motion
- **Deploy**: Shopify Oxygen（`tokyospinvault.com` カスタムドメイン接続済み）
- **Node**: `^22 || ^24`

## クイックスタート

```bash
# 初回
npm install
npm run codegen

# 開発
npm run dev

# 本番ビルド
npm run build

# デプロイ（PowerShell で実行）
npx shopify hydrogen deploy --env production --force
```

<!-- AUTO-GENERATED:SCRIPTS -->
## コマンド一覧

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー（codegen watch 付き） |
| `npm run build` | プロダクションビルド（codegen 付き） |
| `npm run preview` | ビルド + プレビュー |
| `npm run lint` | ESLint |
| `npm run typecheck` | React Router typegen + `tsc --noEmit` |
| `npm run codegen` | Shopify + React Router 型生成 |
<!-- END AUTO-GENERATED -->

<!-- AUTO-GENERATED:ENV -->
## 環境変数（`.env`）

| 変数 | 必須 | 用途 |
|------|------|------|
| `SESSION_SECRET` | ✓ | Cookie 署名秘密鍵（Oxygen で異なる値） |
| `PUBLIC_STORE_DOMAIN` | ✓ | Storefront API のドメイン (`idmrin-0x.myshopify.com`) |
| `PUBLIC_STOREFRONT_API_TOKEN` | ✓ | Storefront API 公開トークン |
| `PUBLIC_STOREFRONT_ID` | ✓ | Storefront ID |
| `PRIVATE_STOREFRONT_API_TOKEN` | ✓ | Storefront Admin 用 private token |
| `PUBLIC_CHECKOUT_DOMAIN` | ✓ | Checkout ドメイン (`tokyo-spin-vault.myshopify.com`) |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | ✓ | Customer Account API |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | ✓ | Customer Account API URL |
| `SHOP_ID` | ✓ | Shopify Shop ID |

> Oxygen Production の環境変数は別途 Shopify Admin → Hydrogen → Environments で同じものを設定する必要がある。
<!-- END AUTO-GENERATED -->

## ドキュメント

詳細ドキュメントは [`docs/`](./docs/) に集約。

| ドキュメント | 内容 |
|------------|------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 技術構成・ディレクトリ構造 |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | ローカル開発・コマンド |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Oxygen デプロイ手順 |
| [docs/SEO.md](./docs/SEO.md) | SEO / 構造化データ / robots / sitemap |
| [docs/SHIPPING.md](./docs/SHIPPING.md) | 配送ポリシー / Express 自動アップグレード |
| [docs/SHOPIFY-SETUP.md](./docs/SHOPIFY-SETUP.md) | Admin API / メタフィールド / コレクション |
| [docs/EBAY-INTEGRATION.md](./docs/EBAY-INTEGRATION.md) | eBay → Shopify インポートパイプライン |

## 主要機能

- **商品管理**: 130 商品（18 件 ACTIVE、112 件 DRAFT）
- **コレクション**: 9 スマートコレクション（タイプ別 / シリーズ別 / カテゴリ別）
- **配送**: ePacket Light 無料 + DDP 関税込み、$300+ or 3個+ で DHL/FedEx 無料アップグレード
- **SEO**: Product / BreadcrumbList / Organization / WebSite JSON-LD、canonical、og:url/image、検証メタタグ
- **パフォーマンス**: Hydrogen `<Image>` で WebP/srcset、Google Fonts 非ブロッキング化、全ルートに CacheShort/CacheLong

## 関連プロジェクト

- **Nexsus** (`~/Desktop/nexsus`): eBay NinJapon 業務管理 (Next.js + Supabase)
- **Obsidian**: `~/iCloudDrive/iCloud~md~obsidian/Obsidian Vault/02-Projects/eBay-NinJapon/`

## Contributing

1. 変更前に `CLAUDE.md` と `docs/DEVELOPMENT.md` を確認
2. Commit 前に `npm run typecheck && npm run build`
3. `.env` 等の秘密情報は絶対にコミットしない
4. ドキュメント更新を伴う変更は `docs/` も同時更新

## License

Proprietary — all rights reserved.
