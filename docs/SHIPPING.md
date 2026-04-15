# Shipping

Tokyo Spin Vault の配送ポリシーと Shopify 設定まとめ。

## 配送モデル

- **標準**: ePacket Light 送料無料（価格込み）
- **関税**: DDP（Delivery Duty Paid）— 購入時に関税込み、着荷時追加料金なし
- **Express**: DHL / FedEx 追加料金、または**自動無料アップグレード**条件あり

## 料金表

| ゾーン | ePacket Light（無料） | DHL/FedEx Express |
|-------|---------------------|-------------------|
| North America | 7–14 日 | $22（3–7 日） |
| Europe | 10–18 日 | $25（4–8 日） |
| Asia-Pacific | 5–12 日 | $18（2–5 日） |
| Rest of World | 10–21 日 | $30（5–10 日） |

## Express 無料アップグレード条件

**$300 以上 または 3 個以上**購入で DHL/FedEx Express が無料。

Shopify 側で自動割引として設定済み:

- `scripts/create-shipping-discounts.mjs` — 割引作成
- `scripts/update-shipping-rates.mjs` — レート更新
- `scripts/update-shipping-policy.mjs` / `-v2.mjs` — ポリシー文更新

## UX 実装

### Cart バナー

`app/components/CartMain.tsx` にアップグレードバーを設置:

- 小計・数量をリアクティブに見て、**あと $X / あと N 個で Express 無料**を表示
- しきい値を越えた瞬間にバナーがグリーン確定表示に切り替わる

### PDP 配送情報

`app/routes/products.$handle.tsx` に配送セクションを明示:

- 「Free Worldwide Shipping + Duties Included」を強調
- ゾーン別納期表（折りたたみ）

## ポリシーページ

Shopify Admin の Policies で設定:

- Shipping Policy（Express アップグレード条件を明記）
- Return Policy
- Privacy Policy / Terms of Service

## 運用スクリプト

| スクリプト | 用途 |
|-----------|------|
| `scripts/setup-policies.mjs` | 初期ポリシー作成 |
| `scripts/setup-shipping.mjs` | Shipping zones / rates 作成 |
| `scripts/update-shipping-rates.mjs` | レート更新 |
| `scripts/update-shipping-policy.mjs` | ポリシー文更新（v1） |
| `scripts/update-shipping-policy-v2.mjs` | ポリシー文更新（v2、最新） |
| `scripts/create-shipping-discounts.mjs` | 自動割引（$300+ / 3個+）作成 |

実行は PowerShell 推奨。`ADMIN_API_TOKEN` 等は `.env` 経由で読み込む前提。

## 注意点

1. **ePacket は原則 2kg 以下**。複数個注文時は実質 DHL 運用になるので、3個+ 無料アップグレードは配送コスト観点でも合理的
2. **DDP のための HS コード**は商品メタフィールドで管理（Harmonized code）。未設定品は関税計算で Merchant Center 警告が出る
3. **価格込み送料モデル**のため、商品価格改定時は送料相当の利益が削られていないか必ず [PRICING-RESEARCH.md](../PRICING-RESEARCH.md) を再確認
