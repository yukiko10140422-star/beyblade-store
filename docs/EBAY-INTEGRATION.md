# eBay Integration

eBay NinJapon（既存事業）の在庫を Shopify にインポートするパイプライン。

## 全体像

```
[Nexsus Supabase]
  │ ebay_accounts テーブル（AES-256-GCM 暗号化）
  ↓ 復号トークン
[eBay Browse API]
  │ セラー: ninjapon
  ↓ 商品 JSON
[scripts/full-import.mjs]
  │ 画像 DL、説明文整形、メタフィールド付与
  ↓ Admin API 2025-04
[Shopify tokyo-spin-vault]
```

## 関連プロジェクト

- **Nexsus**: `~/Desktop/nexsus`（Next.js + Supabase）
  - `ebay_accounts` テーブルが eBay OAuth トークンを保持
  - AES-256-GCM で暗号化されているため、復号鍵（`NEXSUS_ENCRYPTION_KEY`）が必要

## 必要な環境変数

`.env` に以下を配置（Git にはコミット禁止）:

```
# eBay
EBAY_APP_ID=
EBAY_CERT_ID=
EBAY_DEV_ID=

# Nexsus Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
NEXSUS_ENCRYPTION_KEY=

# Shopify
SHOPIFY_ADMIN_API_TOKEN=
SHOPIFY_STORE_DOMAIN=tokyo-spin-vault.myshopify.com
```

## インポートスクリプト

### `scripts/full-import.mjs`

eBay の ACTIVE リスティングを全件取得 → Shopify に新規商品として登録。

処理フロー:

1. Supabase から NinJapon の eBay アクセストークン取得（復号）
2. eBay Browse API で商品一覧を取得（ページング考慮）
3. 各商品について:
   - タイトル英語化（必要に応じて `ebay_translate`）
   - ベイブレードタイプ推定（タイトル / 説明のキーワード）
   - メタフィールド `beyblade.*` を組み立て
   - 画像を Shopify CDN にアップロード
   - Admin API で `productCreate`
4. 結果を `DRAFT` で保存（ACTIVE 昇格は人の目視後）

### `scripts/fix-descriptions.mjs`

eBay の HTML 説明文には `<font>` / inline style が多い。

- 不要タグ除去
- 画像タグを削除（重複するため）
- ブランドフレーズ（eBay セラー名等）を削除

### `scripts/generate-product-feed.mjs`

Shopify Storefront API から ACTIVE 商品を取得 → `public/feeds/products.xml` を生成。
Google Merchant Center が読む XML フォーマット。

## 運用ルール

1. **新規インポートは必ず `DRAFT` で保存**
   - 人の目で画像・翻訳・価格をレビューしてから ACTIVE へ昇格
2. **インポート済み商品の再実行は二重登録リスク**
   - `model_number` メタフィールドで idempotent チェックしてから create
3. **Nexsus のトークンは期限切れに注意**
   - 失敗時は `mcp__ebay-mcp__ebay_get_token_status` で確認、必要なら refresh
4. **eBay の画像は解像度が低いケースあり**
   - 高解像度化は別スクリプトで後処理（出品用商品写真スキル `ebay-product-photo` を併用）

## トラブルシュート

| 症状 | 対処 |
|-----|------|
| 401 Unauthorized | Nexsus のトークン期限切れ → refresh |
| 429 Rate Limit | eBay Browse API の quota。exponential backoff を入れる |
| Shopify 422 | メタフィールド型不一致。`beyblade.*` 定義を Admin で確認 |
| 画像が CDN にならない | `Base64 アップロード` ではなく URL 経由にする |

## 関連ドキュメント

- Obsidian Vault: `02-Projects/eBay-NinJapon/`
- [SHOPIFY-SETUP.md](./SHOPIFY-SETUP.md) — メタフィールド定義・スマートコレクション
