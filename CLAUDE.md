# Beyblade Specialty Store — Shopify Hydrogen

## プロジェクト概要

日本在住セラー（NinJapon）がタカラトミー製ベイブレードを海外向けに販売する Shopify Hydrogen ストア。
既存の eBay 事業（Nexsus で管理中）に加え、D2C チャネルとして Shopify を新設するハイブリッド戦略の一環。

## 技術スタック

- **フレームワーク**: Shopify Hydrogen (Remix ベース)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS（ダークモードファースト、arena テーマ）
- **i18n**: i18next + react-i18next + Shopify @inContext
- **アニメーション**: Framer Motion
- **デプロイ**: Shopify Oxygen
- **パッケージマネージャ**: npm

## 対応ロケール

EN-US (デフォルト), EN-CA, EN-GB, EN-AU, FR-FR, KO-KR, PT-BR, MS-MY, JA-JP

## ベイブレード固有仕様

- **タイプ分類**: Attack (青), Defense (緑), Stamina (橙), Balance (赤)
- **メタフィールド**: `beyblade.*` namespace で blade_name, ratchet_spec, bit_spec, series, type 等
- **互換性チェッカー**: パーツの組み合わせ適合をマトリクス表示
- **コレクション階層**: タイプ別 / シリーズ別 (BX/UX/CX) / パーツ別 / アクセサリ

## 実装計画

`PLAN.md` に 7 フェーズの詳細実装計画書あり（2026行）:
1. Foundation (スキャフォールド、デザインシステム)
2. Internationalization (ロケール、翻訳)
3. Core Pages (Home, Collection, PDP, Cart, Search)
4. Beyblade Features (メタフィールド、互換性チェッカー)
5. Shipping (日本郵便 EMS/小型包装物、関税情報)
6. SEO (hreflang, JSON-LD, サイトマップ)
7. Deployment (Oxygen, ドメイン設定)

## 現在の状態

- **フェーズ**: 計画完了、実装未着手
- **コード**: なし（PLAN.md のみ）
- **Shopify ストア**: 未作成

## 関連プロジェクト

- **Nexsus** (`~/Desktop/nexsus`): eBay NinJapon 業務管理システム (Next.js + Supabase)
- **Obsidian リサーチ**: `~/iCloudDrive/iCloud~md~obsidian/Obsidian Vault/03-Research/越境EC/`
  - `Shopify ベイブレード販売戦略.md` — 市場分析、仕入れ、SEO、SNS 戦略
  - `eBay vs Shopify — 比較と戦略.md` — ハイブリッド戦略
  - `eBay 輸出 — 総合リサーチ.md` — eBay 基礎
  - `Shopify 越境EC — 総合リサーチ.md` — Shopify 基礎

## コマンド

```bash
# スキャフォールド（初回のみ）
npm create @shopify/hydrogen@latest -- --quickstart

# 開発サーバー
npm run dev

# ビルド
npm run build

# デプロイ
npx shopify hydrogen deploy
```

## デザインルール

- **ダークモードファースト**: arena-950 (背景) + primary-500 (青グロー) + accent-300 (金ハイライト)
- **フォント**: Rajdhani (見出し), Inter + Noto Sans JP/KR (本文)
- **カードパターン**: `bg-arena-800/80 backdrop-blur-sm border border-arena-700 rounded-lg`
- **タイプバッジ**: 色 + アイコン + テキスト（色のみに依存しない）
