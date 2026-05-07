# Tokyo Spin Vault — Shopify Hydrogen Beyblade Store

## プロジェクト概要

日本在住セラー（NinJapon）がタカラトミー製ベイブレードを海外向けに販売する Shopify Hydrogen ストア。
既存の eBay 事業（Nexsus で管理中）に加え、D2C チャネルとして Shopify を新設するハイブリッド戦略の一環。

**本番URL**: https://tokyospinvault.com
**Shopify Admin**: tokyo-spin-vault.myshopify.com

## 技術スタック

- **フレームワーク**: Shopify Hydrogen 2026.4.0 (React Router 7.12)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4.2 — ダークモードファースト（vault テーマ）
- **アニメーション**: Framer Motion 12.38
- **デプロイ**: Shopify Oxygen → tokyospinvault.com（カスタムドメイン接続済み）
- **パッケージマネージャ**: npm
- **Node**: ^22 || ^24

## コマンド

<!-- AUTO-GENERATED from package.json -->
| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（codegen 付き） |
| `npm run build` | プロダクションビルド（codegen 付き） |
| `npm run preview` | ビルド + プレビュー |
| `npm run lint` | ESLint |
| `npm run typecheck` | React Router typegen + tsc |
| `npm run codegen` | Shopify + React Router 型生成 |
| `npx shopify hydrogen deploy --env production --force` | Oxygen デプロイ（PowerShell で実行） |
<!-- END AUTO-GENERATED -->

## 現在の状態

- **ステージ**: 本番稼働中（初期フェーズ、監査指摘対応中）
- **ドメイン**: tokyospinvault.com（Oxygen プライマリー）
- **商品数**: 130 件（18 件 ACTIVE、112 件 DRAFT — Draft は $99.99 プレースホルダ価格あり）
- **コレクション**: 9 スマートコレクション（タグ分類が一部不正確 — balance-type に全商品集中）
- **配送モデル**: 8 ゾーン / 108 ヵ国対応
  - ePacket Light 送料無料 (4 ゾーン: NA / EU / APAC / RoW = 38 国)
  - Japan Post EMS 有料 (4 拡張ゾーン: EU Ext $15 / APAC Ext $12 / Latin America $20 / ME&Africa $25 / Pacific Islands $35)
- **Express アップグレード**: DHL/FedEx — $300+ or 3個+ で **$55 まで無料** (Pacific Islands $65 のみ対象外、Shopify 自動割引 2件)
- **i18n**: EN 言語固定 + Country 動的検出 (cookie → `oxygen-buyer-country` ヘッダ → US fallback)。Markets 対象 9 国 (US/AU/DE/FR/GB/IE/SG/TW/PH) は現地通貨表示
- **TypeScript**: `npm run typecheck` 0 errors（Wave 2 で 12→0 に解消済み）

### 既知の制限・未対応

- Shopify primaryDomain が `tokyo-spin-vault.myshopify.com` のまま（Admin UI で要変更）
- 旧 Rise テーマが `tokyo-spin-vault.myshopify.com` で並列稼働中（重複コンテンツリスク）
- Markets が 1 つ「United States」に 9 国混在（US/AU/DE/FR/GB/IE/SG/TW/PH）→ 地域別 Market 分割推奨
- Markets webPresence URL が dev ストア `idmrin-0x.myshopify.com` のまま（→ `tokyospinvault.com` に変更必要）
- `.env` の `PUBLIC_STORE_DOMAIN=idmrin-0x.myshopify.com` と `PUBLIC_CHECKOUT_DOMAIN=tokyo-spin-vault.myshopify.com` の不整合
- Burst / Metal Fight コレクションが main nav に配置されているが商品 0 件
- FAQ/About ページの配送情報が PDP/Shipping Policy と矛盾（旧情報のまま）
- About ページで em dash が「?」に文字化け
- 商品サブ画像が 225x225 の eBay サムネイル流用（低解像度）
- メタフィールドの Storefront API 可視性を PUBLIC_READ に変更済み（反映待ち）
- CountryPicker UI 未実装（`customerCountry` cookie の手動セット手段なし。auto detection は機能中）

## デザインシステム

- **テーマ**: Tokyo Spin Vault — Gold x Black x Chrome x Electric Blue
- **背景**: vault-900 (#0C0C18)
- **アクセント**: gold-400 (#FFD700), gold-500 (#DAA520)
- **タイプカラー**: Attack (bey-attack #3B82F6), Defense (bey-defense #22C55E), Stamina (bey-stamina #F97316), Balance (bey-balance #EF4444)
- **フォント**: Orbitron (見出し), Inter + Noto Sans JP (本文)
- **カードパターン**: `surface-vault rounded-xl` + `hover:glow-gold-sm`
- **タイプバッジ**: `TypeBadge` コンポーネント（色 + アイコン + テキスト）

## ベイブレード固有仕様

- **タイプ分類**: Attack/Defense/Stamina/Balance — `app/lib/beyblade-types.ts` で一元管理
- **メタフィールド**: `beyblade.*` namespace (type, blade_name, ratchet_spec, bit_spec, series, model_number, condition, is_limited_edition, generation)
- **スマートコレクション**: タグベースの自動分類（attack-type, defense-type 等）

## 主要ファイル構成

```
app/
  components/
    home/                  # ホームページセクション（8分割済み）
      HeroSection.tsx      # Enter the Vault ヒーロー
      FeaturedHero.tsx     # Aero Pegasus RED バナー
      NewArrivals.tsx      # 新着商品グリッド
      TypeCategories.tsx   # Attack/Defense/Stamina/Balance
      TrustSignals.tsx     # 信頼バッジ（3,800+ Reviews 含む）
      VaultExclusives.tsx  # 限定商品
      ShippingBanner.tsx   # 送料・DDP バナー
      Newsletter.tsx       # メルマガ登録
      ProductCardSkeleton.tsx
    icons/index.tsx        # 共有 SVG アイコン（8種）
    TypeBadge.tsx          # ベイブレードタイプバッジ
    ProductCard.tsx        # 商品カード（TypeBadge付き）
    Breadcrumbs.tsx        # パンくず（react-router Link）
    NewsletterForm.tsx     # メルマガフォーム（variant: large/compact）
    Header.tsx             # ヘッダー + ナビゲーション
    Footer.tsx             # フッター（SNS, ポリシーリンク）
    Aside.tsx              # カート/検索/モバイルメニュードロワー（フォーカストラップ付き）
    CartMain.tsx           # カート本体（$300/3個 Express バー）
    motion.tsx             # Framer Motion ラッパー
  lib/
    beyblade-types.ts      # BEY_TYPES, TYPE_CONFIG, isBeyType()
    constants.ts           # SITE_URL
    fragments.ts           # 共有 GraphQL フラグメント（Money, ProductItem, Cart, Menu）
  routes/
    _index.tsx             # ホーム（104行、セクションは home/ にインポート）
    products.$handle.tsx   # PDP（メタフィールド, 関連商品, BeybladeSpecs）
    collections.$handle.tsx # コレクション（フィルタ + ソート + BreadcrumbList）
server.ts                  # Oxygen fetch ハンドラ（robots.txt インターセプト）
public/
  images/                  # WebP 最適化済み画像（logo, tokyo-night, og-home）
  robots.txt               # SEO クロール許可 + Sitemap 参照
  feeds/products.xml       # Google Merchant Center 商品フィード
  site.webmanifest         # PWA マニフェスト
docs/                      # 運用・開発ドキュメント（8ファイル）
```

## 外部サービス連携

| サービス | 状態 | 用途 |
|---------|------|------|
| Google Search Console | 検証済み | SEO 監視 |
| Google Merchant Center (ID: 5765860024) | 登録済み | Google Shopping 無料掲載 |
| Bing Webmaster Tools | 検証済み | Bing SEO |
| Pinterest Business | アカウント作成済み | Pinterest ピン |
| Instagram (@tsv_2026) | アカウント作成済み | SNS |
| TikTok (@tokyo.spin.vault) | アカウント作成済み | SNS |

## 配送設定

8 ゾーン構成 (108 ヵ国対応、2026-05-07 拡張)。

### ePacket Light ゾーン (送料無料、価格込み)
| ゾーン | 国数 | 標準 | Express |
|-------|------|------|---------|
| North America | 3 (US, CA, MX) | 無料 (7-14日) | $22 (3-7日) |
| Europe | 16 (西欧主要) | 無料 (10-18日) | $25 (4-8日) |
| Asia-Pacific | 11 (主要アジア+豪NZ) | 無料 (5-12日) | $18 (2-5日) |

### Japan Post EMS ゾーン (実費請求)
| ゾーン | 国数 | 標準 | Express |
|-------|------|------|---------|
| Europe Extended | 27 (中東欧/北欧離島/トルコ) | $15 (7-14日) | $35 (4-8日) |
| Asia-Pacific Extended | 8 (印/南アジア/東南ア) | $12 (5-10日) | $30 (3-7日) |
| Latin America | 19 (南米/カリブ) | $20 (10-15日) | $45 (5-9日) |
| Middle East & Africa | 21 (湾岸/北アフリカ) | $25 (10-18日) | $55 (5-10日) |
| Pacific Islands | 3 (FJ, NC, PG) | $35 (7-14日) | $65 (4-8日) |

**Express 無料条件**: $300以上 or 3個以上で Express **$55 まで無料**
（Shopify 自動割引設定済み、Pacific Islands $65 のみ対象外）

### 除外国 (リスク回避、23 国)
- 制裁/紛争: RU, BY, UA, IR, KP, SY, YE, IQ, AF, SD
- 経済不安定: CU, VE, LB, MM
- 高詐欺率: NG, BD, PK, ZW
- インフラ脆弱: AO, MZ, MW, ZM, ET, RW

## Shopify Admin API

- **Token**: `.env` または既存スクリプト内で参照（Git にコミットしない）
- **API**: `https://tokyo-spin-vault.myshopify.com/admin/api/2025-04`
- **Publications**: 3 チャネル（Online Store, Hydrogen, Google & YouTube）

## eBay 連携

- eBay Browse API でセラー `ninjapon` の商品を取得
- トークンは Supabase (Nexsus) の `ebay_accounts` テーブルから AES-256-GCM で復号
- `scripts/full-import.mjs` で eBay → Shopify の一括インポート
- `scripts/enrich-products.mjs` で画像加工 + 説明文充実

## 関連プロジェクト

- **Nexsus** (`~/Desktop/nexsus`): eBay NinJapon 業務管理システム (Next.js + Supabase)
- **Obsidian**: `~/iCloudDrive/iCloud~md~obsidian/Obsidian Vault/`
  - `02-Projects/eBay-NinJapon/` — ビジネス戦略、セットアップガイド
  - `03-Research/越境EC/` — 市場分析、配送戦略、SNS マーケティング
