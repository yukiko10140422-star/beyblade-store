# Architecture

## 技術スタック

| レイヤ | 採用技術 |
|-------|---------|
| フレームワーク | Shopify Hydrogen 2026.4.0 |
| ルーティング | React Router 7.12 |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4.2（ダークモード固定） |
| アニメーション | Framer Motion 12.38 |
| デプロイ | Shopify Oxygen（tokyospinvault.com） |
| Node | ^22 \|\| ^24 |

## ディレクトリ構造

```
app/
├── components/
│   ├── TypeBadge.tsx         # Attack/Defense/Stamina/Balance バッジ
│   ├── ProductCard.tsx       # 商品カード（TypeBadge 付き）
│   ├── Header.tsx            # グローバルナビ
│   ├── Footer.tsx            # SNS / ポリシーリンク
│   ├── Aside.tsx             # カートドロワー / 検索 / モバイルメニュー
│   ├── CartMain.tsx          # カート本体（Express アップグレード導線）
│   ├── Breadcrumbs.tsx       # パンくず + BreadcrumbList JSON-LD
│   ├── NewsletterForm.tsx    # メルマガ登録
│   └── motion.tsx            # Framer Motion ラッパー
├── lib/
│   └── beyblade-types.ts     # BEY_TYPES / TYPE_CONFIG / isBeyType()
├── routes/
│   ├── _index.tsx            # ホーム（Hero / Arrivals / Types）
│   ├── products.$handle.tsx  # PDP（メタフィールド・JSON-LD・DDP 配送情報）
│   └── collections.$handle.tsx # コレクション（フィルタ / ソート）
└── styles/
    └── app.css               # Tailwind @theme トークン
server.ts                     # Oxygen fetch ハンドラ（robots.txt インターセプト含む）
public/
├── robots.txt                # クロール許可 + Sitemap 参照
├── feeds/products.xml        # Google Merchant Center 商品フィード
└── google*.html              # Search Console 検証
scripts/                      # eBay → Shopify インポート等の運用スクリプト
```

## データフロー

```
[eBay NinJapon]
  ↓ Browse API（Nexsus Supabase から AES-256-GCM 復号トークン）
[scripts/full-import.mjs]
  ↓ Shopify Admin API 2025-04
[Shopify Admin（tokyo-spin-vault.myshopify.com）]
  ↓ Storefront API（Hydrogen SSR）
[Oxygen Edge（tokyospinvault.com）]
  ↓ SSR HTML + 商品 JSON-LD
[User]
```

## ベイブレード固有モデル

- **タイプ**: Attack / Defense / Stamina / Balance — `app/lib/beyblade-types.ts` が単一の情報源
- **メタフィールド namespace**: `beyblade.*`
  - `type`, `blade_name`, `ratchet_spec`, `bit_spec`, `series`,
    `model_number`, `condition`, `is_limited_edition`, `generation`
- **スマートコレクション**: タグベースで自動分類（`attack-type`, `defense-type` 等）

## デザイントークン

- 背景: `vault-900` (#0C0C18)
- アクセント: `gold-400` (#FFD700), `gold-500` (#DAA520)
- タイプ色: `bey-attack` / `bey-defense` / `bey-stamina` / `bey-balance`
- フォント: Orbitron（見出し）、Inter + Noto Sans JP（本文）
- 共通パターン: `surface-vault rounded-xl` + `hover:glow-gold-sm`

## 設計原則

1. **Server-first**: ローダーで Storefront API を叩き、クライアント JS を最小化
2. **Fragment 集約**: GraphQL フラグメントは `app/lib/fragments.ts` に集中
3. **タイプ分類の単一情報源**: `beyblade-types.ts` を経由せず色やアイコンをハードコードしない
4. **SEO は SSR で固定**: JSON-LD / canonical / og:image は必ずサーバー側で出力
