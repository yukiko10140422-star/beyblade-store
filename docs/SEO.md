# SEO

Tokyo Spin Vault の検索エンジン / ショッピングプラットフォーム最適化まとめ。

## 登録済みサービス

| サービス | ID / 状態 | 用途 |
|---------|----------|------|
| Google Search Console | 検証済み | クロール状況・検索パフォーマンス監視 |
| Google Merchant Center | 5765860024 | Google Shopping 無料掲載 |
| Bing Webmaster Tools | 検証済み | Bing SEO |
| Pinterest Business | 登録済み | Pinterest ピン |

## 検証ファイル

| ファイル | 役割 |
|--------|------|
| `public/google06d92a1753220616.html` | Google Search Console 所有権確認 |
| `public/robots.txt` | クロール許可 + `Sitemap:` 宣言 |
| `public/feeds/products.xml` | Google Merchant Center 商品フィード |

## robots.txt

`server.ts` がルートリクエストをインターセプトして `public/robots.txt` を返す。

- Shopify デフォルトの `/checkouts/`, `/cart/`, `/search` などは Disallow
- `Sitemap: https://tokyospinvault.com/sitemap.xml` を末尾に追加

## sitemap.xml

Hydrogen 標準の `/sitemap.xml` を使用。全 ACTIVE 商品と全コレクションが自動で入る。

## 構造化データ（JSON-LD）

React Router 7 の `links` 関数で `script:ld+json` 仕様を使い、SSR で埋め込む。

### Product JSON-LD（products.$handle.tsx）

```ts
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": title,
  "image": featuredImage.url,   // tokyospinvault.com ドメイン確定済み
  "brand": { "@type": "Brand", "name": vendor },
  "offers": {
    "@type": "Offer",
    "price": selectedVariant.price.amount,
    "priceCurrency": selectedVariant.price.currencyCode,
    "availability": "https://schema.org/InStock",
    "url": canonical
  }
}
```

### BreadcrumbList JSON-LD（Breadcrumbs.tsx）

collections / product ページにパンくず構造を出力。

## メタタグ

- `title` / `description`: 各ルートの `meta` 関数で商品・コレクション情報から動的生成
- `og:image`: 必ず Shopify CDN（`cdn.shopify.com`）URL を使う
- `canonical`: ルート URL を `tokyospinvault.com` で固定（myshopify.dev を絶対に漏らさない）

## 既知の落とし穴

1. **二重エンコード**
   Storefront API の `seo.description` が HTML エンティティ済みのケースがある。`meta` 関数でさらに escape しないこと。

2. **myshopify.dev ドメイン混入**
   画像 URL / リンク URL に `.myshopify.dev` が紛れると Merchant Center が弾く。ナビ生成時に `new URL(url, 'https://tokyospinvault.com').toString()` で正規化。

3. **JSON-LD の重複**
   React Router の `links` 関数で出す場合、`handle.tsx` のルートで複数定義すると重複する。1 ルート 1 JSON-LD に限定。

## 月次チェック項目

- [ ] Search Console: Coverage でエラー・警告ゼロ
- [ ] Merchant Center: Disapproved products ゼロ
- [ ] Bing Webmaster Tools: Index 件数
- [ ] PageSpeed Insights: モバイル LCP < 2.5s
