# Deployment

## 本番環境

- **URL**: https://tokyospinvault.com
- **ホスティング**: Shopify Oxygen（エッジ）
- **Shopify Admin**: tokyo-spin-vault.myshopify.com
- **ブランチ**: `main`（production 環境に直結）

## デプロイコマンド

PowerShell（推奨）で実行:

```powershell
npx shopify hydrogen deploy --env production --force
```

> Git Bash だと一部のコマンドで EOL / stdin 問題が出るため、デプロイ時は PowerShell を使う。

## 事前チェック

1. `npm run typecheck`
2. `npm run build`
3. `.env` が staged にない（`git status` 確認）
4. `main` が最新（`git pull --rebase`）

## ドメイン設定

- プライマリー: `tokyospinvault.com`（Oxygen 直）
- リダイレクト: `www.tokyospinvault.com` → `tokyospinvault.com`
- myshopify ドメイン（`tokyo-spin-vault.myshopify.com`）は**ユーザー露出しない**
  - ナビリンク、JSON-LD、og:image は必ず `tokyospinvault.com` を使う
  - Storefront API レスポンスに `.myshopify.dev` ドメインが混入するケースがあるため、表示前に `new URL()` で `origin` を差し替える

## ロールバック

Oxygen はデプロイ履歴を保持している。問題発生時は:

1. Shopify Admin → Hydrogen → Deployments からロールバック対象を選択
2. もしくはローカルで safe な直前コミットを `cherry-pick` → 再デプロイ

## デプロイ後チェック

| 項目 | 確認方法 |
|-----|---------|
| トップ表示 | https://tokyospinvault.com にアクセス |
| PDP | 任意商品で画像・メタフィールド・価格が正しい |
| og:image | `view-source` で og:image が `tokyospinvault.com` ドメイン |
| JSON-LD | view-source で `application/ld+json` が PDP で 2件（Product + BreadcrumbList）、ホームで 2件（WebSite + Organization） |
| robots.txt | `https://tokyospinvault.com/robots.txt` が 200 |
| sitemap | `https://tokyospinvault.com/sitemap.xml` が 200 |
| Cart → Checkout | 商品追加 → Checkout → `tokyo-spin-vault.myshopify.com` にリダイレクト |
| BeybladeSpecs | PDP に Specifications セクション（Type/Blade/Ratchet/Bit 等）表示 |
| Google Fonts | Orbitron が見出しに適用（system-ui fallback でないこと） |
| Mobile | iPhone 実機または devtools で確認 |

## Merchant Center / Search Console

デプロイで URL 構造が変わった場合:

1. Google Search Console で `sitemap.xml` を再送信
2. Merchant Center でフィード URL（`/feeds/products.xml`）を確認
3. 変更が大きければ Bing Webmaster Tools にも通知

## 関連

- [SEO.md](./SEO.md) — robots.txt / sitemap / メタデータ
- [SHOPIFY-SETUP.md](./SHOPIFY-SETUP.md) — Admin API / publications
