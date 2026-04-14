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

- **ステージ**: 本番稼働中
- **ドメイン**: tokyospinvault.com（Oxygen プライマリー）
- **商品数**: 130 件（18 件 ACTIVE、112 件 DRAFT）
- **コレクション**: 9 スマートコレクション（タイプ別/シリーズ別/カテゴリ別）
- **配送モデル**: ePacket Light 送料無料（価格込み）+ DDP 関税込み
- **Express アップグレード**: DHL/FedEx — $300+ or 3個+ で無料

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
    TypeBadge.tsx        # ベイブレードタイプバッジ
    ProductCard.tsx       # 商品カード（TypeBadge付き）
    Header.tsx           # ヘッダー + ナビゲーション
    Footer.tsx           # フッター（SNS, ポリシーリンク）
    Aside.tsx            # カートドロワー/検索/モバイルメニュー
    CartMain.tsx         # カート本体（Express アップグレードバー）
    motion.tsx           # Framer Motion ラッパー
  lib/
    beyblade-types.ts    # BEY_TYPES, TYPE_CONFIG, isBeyType()
  routes/
    _index.tsx           # ホーム（Hero + Featured Aero Pegasus + Arrivals + Types）
    products.$handle.tsx # PDP（メタフィールド表示, DDP 配送情報）
    collections.$handle.tsx # コレクション（フィルタ + ソート）
  styles/
    app.css              # Tailwind @theme トークン + カスタムユーティリティ
server.ts                # Oxygen fetch ハンドラ（robots.txt インターセプト）
public/
  robots.txt             # SEO クロール許可 + Sitemap 参照
  feeds/products.xml     # Google Merchant Center 商品フィード
  google06d92a1753220616.html  # Search Console HTML 検証
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

| ゾーン | ePacket Light | DHL/FedEx Express |
|-------|--------------|-------------------|
| North America | 無料 (7-14日) | $22 (3-7日) |
| Europe | 無料 (10-18日) | $25 (4-8日) |
| Asia-Pacific | 無料 (5-12日) | $18 (2-5日) |
| Rest of World | 無料 (10-21日) | $30 (5-10日) |

**Express 無料条件**: $300以上 or 3個以上（Shopify 自動割引設定済み）

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
