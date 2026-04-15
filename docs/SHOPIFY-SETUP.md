# Shopify Setup

Tokyo Spin Vault 固有の Shopify Admin 設定まとめ。

## 基本情報

- **ストア**: tokyo-spin-vault.myshopify.com
- **プラン**: Basic（もしくは運用中プラン）
- **プライマリドメイン**: tokyospinvault.com
- **Admin API バージョン**: `2025-04`

## Admin API

エンドポイント:

```
https://tokyo-spin-vault.myshopify.com/admin/api/2025-04
```

トークンは `.env` に格納（Git にはコミットしない）。スクリプト類は `scripts/*.mjs` で API 呼び出しを抽象化。

## Publications（販売チャネル）

3 チャネル有効:

1. **Online Store**（従来 Liquid テーマ、Hydrogen 併存用）
2. **Hydrogen**（tokyospinvault.com — 本番）
3. **Google & YouTube**（Merchant Center 連携）

> 商品を追加したら publish 漏れがないか Admin の Products → 各商品 → "Sales channels and apps" で確認。

## メタフィールド定義

すべて namespace `beyblade.`:

| キー | 型 | 例 |
|-----|----|---|
| `type` | single_line_text | `attack` / `defense` / `stamina` / `balance` |
| `blade_name` | single_line_text | `Aero Pegasus` |
| `ratchet_spec` | single_line_text | `4-60` |
| `bit_spec` | single_line_text | `Needle` |
| `series` | single_line_text | `BX-37` |
| `model_number` | single_line_text | `BX-37 01` |
| `condition` | single_line_text | `new` / `used` |
| `is_limited_edition` | boolean | `true` / `false` |
| `generation` | single_line_text | `X` / `Burst` / `Metal` |

`type` はタグ（`attack-type` 等）と対応しており、スマートコレクションの条件に使う。

## スマートコレクション

| handle | 条件 |
|--------|------|
| `attack-type` | タグに `attack-type` を含む |
| `defense-type` | タグに `defense-type` を含む |
| `stamina-type` | タグに `stamina-type` を含む |
| `balance-type` | タグに `balance-type` を含む |
| `x-series` | タグに `series:x` |
| `burst-series` | タグに `series:burst` |
| `limited-edition` | メタフィールド `beyblade.is_limited_edition = true` |
| `new-arrivals` | 作成日が直近 30 日 |
| `aero-pegasus` | タグに `aero-pegasus`（フィーチャー用） |

## 商品運用スクリプト

| スクリプト | 用途 |
|----------|------|
| `scripts/full-import.mjs` | eBay → Shopify 一括インポート |
| `scripts/fix-descriptions.mjs` | 説明文の整形・HTML クリーン |
| `scripts/generate-product-feed.mjs` | `public/feeds/products.xml` 生成 |

## 初期セットアップ順

1. Admin で Market（ゾーン）と通貨を設定
2. `scripts/setup-policies.mjs` でポリシー作成
3. `scripts/setup-shipping.mjs` で送料ゾーン作成
4. `scripts/create-shipping-discounts.mjs` で Express 無料アップグレード
5. メタフィールド定義を Admin で登録
6. スマートコレクションを Admin で作成
7. `scripts/full-import.mjs` で商品取り込み
8. 必要商品を ACTIVE に昇格、Publications で 3 チャネル有効化

## 関連

- [SHIPPING.md](./SHIPPING.md) — 配送ポリシーの詳細
- [EBAY-INTEGRATION.md](./EBAY-INTEGRATION.md) — インポートパイプライン
