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
│   ├── home/                    # ホームページセクション（8分割済み）
│   │   ├── HeroSection.tsx      # Enter the Vault ヒーロー
│   │   ├── FeaturedHero.tsx     # Aero Pegasus RED バナー
│   │   ├── NewArrivals.tsx      # 新着商品グリッド
│   │   ├── TypeCategories.tsx   # Choose Your Type（4タイプ）
│   │   ├── TrustSignals.tsx     # 信頼バッジ（3,800+ eBay Reviews 含む）
│   │   ├── VaultExclusives.tsx  # 限定商品
│   │   ├── ShippingBanner.tsx   # 送料・DDP バナー
│   │   ├── Newsletter.tsx       # メルマガ登録
│   │   └── ProductCardSkeleton.tsx
│   ├── icons/index.tsx          # 共有 SVG アイコン（19種）
│   ├── TypeBadge.tsx            # Attack/Defense/Stamina/Balance バッジ
│   ├── ProductCard.tsx          # 商品カード（TypeBadge 付き）
│   ├── Breadcrumbs.tsx          # パンくず（react-router Link）
│   ├── NewsletterForm.tsx       # メルマガ登録（variant: large/compact）
│   ├── Header.tsx               # グローバルナビ（icons import）
│   ├── Footer.tsx               # SNS / ポリシーリンク（icons import）
│   ├── Aside.tsx                # カート/検索/モバイルメニュー（フォーカストラップ付き）
│   ├── CartMain.tsx             # カート本体（$300/3個 Express バー）
│   ├── SearchResults.tsx        # 検索結果（ダークテーマ）
│   ├── SearchResultsPredictive.tsx # 予測検索（ダークテーマ）
│   ├── SearchFormPredictive.tsx # 予測検索フォーム（250ms debounce）
│   └── motion.tsx               # Framer Motion ラッパー
├── lib/
│   ├── beyblade-types.ts        # BEY_TYPES / TYPE_CONFIG / isBeyType()
│   ├── constants.ts             # SITE_URL
│   └── fragments.ts            # 共有 GraphQL フラグメント（アーキテクチャ doc 付き）
├── routes/
│   ├── _index.tsx               # ホーム（104行、セクションは home/ にインポート）
│   ├── products.$handle.tsx     # PDP（メタフィールド・関連商品・BeybladeSpecs・JSON-LD）
│   ├── collections.$handle.tsx  # コレクション（フィルタ + ソート + BreadcrumbList）
│   └── account.orders.*.tsx     # 注文履歴（ダークテーマ適用済み）
└── styles/
    └── app.css                  # Tailwind @theme トークン + カスタムユーティリティ
server.ts                        # Oxygen fetch ハンドラ（robots.txt + /cart/c/ リダイレクト）
public/
├── images/                      # WebP 最適化済み画像（logo, tokyo-night, og-home）
├── robots.txt                   # クロール許可 + Sitemap 参照
├── feeds/products.xml           # Google Merchant Center 商品フィード
├── site.webmanifest             # PWA マニフェスト
└── google*.html                 # Search Console 検証
scripts/                         # eBay → Shopify インポート等の運用スクリプト（.gitignore）
docs/                            # 運用・開発ドキュメント（8ファイル）
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
