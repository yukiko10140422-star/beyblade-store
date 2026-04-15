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

React Router 7 の `meta` 関数で `'script:ld+json'` キーにオブジェクトを渡す。stringify しないこと（React Router が 1 回だけシリアライズする）。

### ページ別スキーマ

| ページ | スキーマ |
|--------|---------|
| ホーム (`_index.tsx`) | WebSite (SearchAction 含む) + Organization |
| PDP (`products.$handle.tsx`) | Product + BreadcrumbList |
| コレクション (`collections.$handle.tsx`) | BreadcrumbList |

### Product schema (products.$handle.tsx)

```ts
{
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: selectedVariant.image.url,
  sku: selectedVariant.sku,
  brand: {'@type': 'Brand', name: vendor},
  offers: {
    '@type': 'Offer',
    price, priceCurrency,
    availability: 'https://schema.org/InStock',
    seller: {'@type': 'Organization', name: 'Tokyo Spin Vault'},
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingOrigin: {'@type': 'DefinedRegion', addressCountry: 'JP'},
    },
  },
}
```

### WebSite + SearchAction (ホーム)

サイト内検索ボックスを Google SERP に表示するため:

```ts
{
  '@type': 'WebSite',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}
```

### BreadcrumbList

PDP とコレクション両方で Home → Collections → [現在位置] のリストを出力。

## メタタグ

- `title`: PDP は 50 字超なら `... | TSV`、それ以下は `... | Tokyo Spin Vault`
- `description`: PDP は `buildProductMetaDescription()` で自動生成（タイトル + $価格 + タイプ + 正規品 + 送料無料、160 字以内）
- `canonical`: `root.tsx` の `Layout` コンポーネントで全ページ共通に出力（`${SITE_URL}${pathname}`）
- `og:url`: 全ページで絶対 URL を動的生成
- `og:image`: 絶対 URL（PDP は Shopify CDN、それ以外は `${SITE_URL}/images/logo.png`）
- `og:image:width` / `og:image:height`: Shopify CDN 画像は実寸、ロゴは 400x400
- `twitter:card`: `summary_large_image`
- 検証メタタグ: `google-site-verification` / `p:domain_verify` / `msvalidate.01`

### SITE_URL 定数

`app/lib/constants.ts` に定義:

```ts
export const SITE_URL = 'https://tokyospinvault.com';
```

ハードコードを排除し、ドメイン変更時に 1 箇所修正で済むように。

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
