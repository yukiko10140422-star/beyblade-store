# Chrome in Claude — SEO/マーケティング設定プロンプト集

以下のプロンプトを Chrome in Claude に順番に渡して実行してください。
各プロンプトは独立しており、1つずつ実行できます。

---

## B1: Shopify primaryDomain を変更

```
Shopify Admin にログインしてください。
URL: https://tokyo-spin-vault.myshopify.com/admin

Settings > Domains に移動してください。

現在 primaryDomain が「tokyo-spin-vault.myshopify.com」になっているはずです。
「tokyospinvault.com」をプライマリードメインに変更してください。

手順:
1. Settings（左下の歯車アイコン）をクリック
2. 「Domains」をクリック
3. 「tokyospinvault.com」の横の「Change primary」または「Set as primary」をクリック
4. 確認ダイアログで承認

これにより myshopify.com へのアクセスが自動的に tokyospinvault.com に301リダイレクトされ、
Google が正しい canonical URL を認識します。

完了したらスクリーンショットを撮ってください。
```

---

## B2: 旧 Rise テーマを unpublish

```
Shopify Admin で Online Store > Themes に移動してください。
URL: https://tokyo-spin-vault.myshopify.com/admin/themes

現在「Rise」という旧テーマが公開状態で残っている可能性があります。
Hydrogen ストアフロント（tokyospinvault.com）とは別に、
myshopify.com で Rise テーマが表示されると重複コンテンツの問題が発生します。

手順:
1. Online Store > Themes に移動
2. 公開中の（Published）テーマが Rise の場合:
   - 「⋯」メニューから「Unpublish」を選択
   - または、パスワード保護を有効にする（Online Store > Preferences > Password protection）
3. もし Hydrogen がテーマとして表示されていない場合は、
   Rise テーマの「Customize」→「Theme settings」→「Password protection」で
   パスワードを設定して事実上アクセス不可にする

目的: myshopify.com での重複コンテンツを排除し、SEO ペナルティを防ぐ。

完了したらスクリーンショットを撮ってください。
```

---

## B3: Primary Market を US に変更

```
Shopify Admin で Settings > Markets に移動してください。
URL: https://tokyo-spin-vault.myshopify.com/admin/settings/markets

現在 Primary Market が「Japan (JP)」に設定されています。
海外向けストアなので US に変更する必要があります。

手順:
1. Settings > Markets に移動
2. 「Primary market」セクションを確認
3. 現在 Japan になっている場合:
   - 「Japan」をクリック
   - 「Remove as primary」または「Change primary market」を選択
   - 「United States」を Primary market として設定
4. Japan は International market または Secondary market として残しておいて OK

これにより:
- デフォルト通貨が USD になる
- Shopify の自動最適化が US 向けになる
- Analytics のデフォルトビューが US ベースになる

完了したらスクリーンショットを撮ってください。
```

---

## B4: Google Search Console — サイトマップ送信 + URL インデックス登録

```
Google Search Console にログインしてください。
URL: https://search.google.com/search-console

プロパティ: https://tokyospinvault.com を選択。
（まだ追加されていない場合は URL prefix 方式で追加。検証は既にmeta タグで完了済み）

■ ステップ1: サイトマップ送信
1. 左メニューの「Sitemaps」をクリック
2. 「Add a new sitemap」に以下を入力して送信:
   - https://tokyospinvault.com/sitemap.xml
3. ステータスが「Success」になることを確認
4. もしサブサイトマップが表示されたら、それらも個別に確認

■ ステップ2: 主要ページのインデックス登録リクエスト
1. 上部の検索バー（URL inspection）に以下のURLを1つずつ入力:

ホーム:
https://tokyospinvault.com/

コレクション:
https://tokyospinvault.com/collections/all
https://tokyospinvault.com/collections/attack-type
https://tokyospinvault.com/collections/defense-type
https://tokyospinvault.com/collections/stamina-type
https://tokyospinvault.com/collections/balance-type
https://tokyospinvault.com/collections/new-arrivals
https://tokyospinvault.com/collections/limited-edition

主要商品（ACTIVE商品）:
https://tokyospinvault.com/products/beyblade-x-ux-00-aero-pegasus-3-70a-red-version-japan-exclusive
https://tokyospinvault.com/products/beyblade-x-orochi-cluster-6-60lf-corocoro-comic-executive-2025
https://tokyospinvault.com/products/beyblade-x-bx-00-starter-cobaltdragoon-9-60f-metal-coat-white-j-league-ver
https://tokyospinvault.com/products/beyblade-x-bx-00-starter-dransword-1-60v-metal-coat-black-j-league-ver
https://tokyospinvault.com/products/us-duty-free-beyblade-x-valkyrie-volt-s4-70v-metal-coat-gold
https://tokyospinvault.com/products/beyblade-x-wizard-rod-metal-coat-gold-unused-g3-tournament-1st-prize-only-blade
https://tokyospinvault.com/products/beyblade-x-ux-00-samurai-saber-5-60k-metal-coat-samurai-blue-japan-national-team-ver

2. 各URLについて「Request indexing」をクリック
3. 1日のリクエスト上限があるため、できるだけ多く処理する
   （上限に達した場合は翌日に残りを処理）

■ ステップ3: パフォーマンス確認
1. 「Performance」タブで過去のデータを確認
2. 「Coverage」または「Pages」タブでインデックス状況を確認
3. エラーがあればスクリーンショットを撮って報告

完了したら各ステップのスクリーンショットを撮ってください。
```

---

## B5: Bing Webmaster Tools — サイトマップ送信

```
Bing Webmaster Tools にログインしてください。
URL: https://www.bing.com/webmasters

サイト: https://tokyospinvault.com を選択。
（検証は meta タグ E97753D3F97C661E3363E96380EEACDA で既に完了済み）

手順:
1. 左メニューの「Sitemaps」をクリック
2. 「Submit sitemap」をクリック
3. 以下のURLを入力して送信:
   https://tokyospinvault.com/sitemap.xml
4. ステータスが「Success」になることを確認

追加設定:
5. 「Configure My Site」>「Crawl Control」に移動
6. クロール頻度を「Medium」に設定（サーバー負荷回避）

7.「URL Parameters」に移動し、以下のパラメータを「Don't crawl」に設定:
   - sort（コレクションのソート）
   - type（コレクションのフィルター）
   - cursor（ページネーション）
   - direction（ページネーション方向）

これによりクロールバジェットを商品ページに集中させます。

完了したらスクリーンショットを撮ってください。
```

---

## B6: Pinterest Rich Pins 検証・申請

```
Pinterest の Rich Pins Validator にアクセスしてください。
URL: https://developers.pinterest.com/tools/url-debugger/

手順:
1. 以下のURLを入力して「Debug」をクリック:
   https://tokyospinvault.com/products/beyblade-x-ux-00-aero-pegasus-3-70a-red-version-japan-exclusive

2. 結果を確認:
   - og:type が「product」であること
   - product:price:amount が表示されること
   - product:price:currency が「USD」であること
   - product:availability が表示されること
   - product:brand が「Takara Tomy」であること

3. すべて正常なら「Apply for Rich Pins」をクリック
   （ボタンが表示されない場合、Pinterest ドメイン検証が必要。
    検証コード p:domain_verify=2d861d68f97ec2ce9b173da9cdcf50b6 は既に設定済み）

4. Rich Pins の申請が受理されると、数時間〜数日で全商品ピンに
   価格・在庫状態が自動表示されるようになる

追加で Pinterest Business アカウント（もし未設定なら）:
5. https://business.pinterest.com/ にアクセス
6. 「Claim your website」で tokyospinvault.com を確認
7. 「Catalogs」>「Data sources」で Shopify の商品フィードを接続
   （Shopify Admin > Sales Channels > Pinterest アプリ経由が最も簡単）

完了したらスクリーンショットを撮ってください。
```

---

## B7: Google Tag Manager コンテナ作成 + GA4 タグ設定

```
Google Tag Manager にログインしてください。
URL: https://tagmanager.google.com/

■ ステップ1: コンテナ作成
1. 「Create Account」をクリック
2. Account Name: Tokyo Spin Vault
3. Country: Japan
4. Container Name: tokyospinvault.com
5. Target Platform: Web
6. 作成後、Container ID（GTM-XXXXXXX 形式）をメモしてください
   ※ この ID は後で Hydrogen のコードに埋め込みます

■ ステップ2: GA4 設定タグ
1. Tags > New をクリック
2. Tag Configuration:
   - Tag Type: Google Analytics: GA4 Configuration
     （または「Google Tag」を選択）
   - Measurement ID: （GA4 の Measurement ID を入力。B8 で作成後に設定）
3. Triggering: All Pages
4. Tag Name: GA4 - Configuration
5. Save

■ ステップ3: E-commerce イベントタグ
以下のタグを作成:

a) view_item タグ:
   - Tag Type: GA4 Event
   - Configuration Tag: GA4 - Configuration
   - Event Name: view_item
   - Trigger: Custom Event > product_viewed
   - Event Parameters:
     - items: {{dataLayer variable: ecommerce.items}}

b) add_to_cart タグ:
   - Tag Type: GA4 Event
   - Event Name: add_to_cart
   - Trigger: Custom Event > add_to_cart
   - Event Parameters:
     - items: {{dataLayer variable: ecommerce.items}}
     - value: {{dataLayer variable: ecommerce.value}}
     - currency: {{dataLayer variable: ecommerce.currency}}

c) begin_checkout タグ:
   - Tag Type: GA4 Event
   - Event Name: begin_checkout
   - Trigger: Custom Event > begin_checkout

■ ステップ4: 公開
1. Submit > Publish
2. Version Name: Initial GA4 Setup

重要: Container ID (GTM-XXXXXXX) を必ずメモして報告してください。
コード側（Hydrogen）でこの ID を使ってGTMスクリプトをロードします。

完了したらContainer IDとスクリーンショットを撮ってください。
```

---

## B8: Google Analytics 4 プロパティ作成

```
Google Analytics にログインしてください。
URL: https://analytics.google.com/

■ ステップ1: GA4 プロパティ作成
1. Admin（左下の歯車）> Create Property
2. Property name: Tokyo Spin Vault
3. Reporting time zone: United States - Pacific Time（または Eastern Time）
4. Currency: US Dollar (USD)
5. 「Next」をクリック
6. Business details:
   - Industry: Shopping
   - Business size: Small
7. Business objectives: 「Generate leads」と「Drive online sales」を選択
8. 「Create」をクリック

■ ステップ2: Data Stream 作成
1. Admin > Data Streams > Add stream > Web
2. Website URL: https://tokyospinvault.com
3. Stream name: Tokyo Spin Vault Web
4. Enhanced Measurement: ON（すべてのオプションを有効）
5. 作成後、Measurement ID（G-XXXXXXXXXX 形式）をメモ
   ※ この ID を B7 の GTM タグに設定します

■ ステップ3: E-commerce 設定
1. Admin > Data Settings > Data Collection
2. Google signals data collection: ON
3. User data collection acknowledgement: 確認

■ ステップ4: コンバージョン設定
1. Admin > Events > Mark as conversion（右のトグル）:
   - purchase: ON
   - add_to_cart: ON（マイクロコンバージョンとして）
2. もし purchase イベントがまだ表示されていない場合は、
   データが入り始めてから設定

■ ステップ5: Search Console リンク
1. Admin > Product Links > Search Console
2. 「Link」をクリック
3. Search Console プロパティ「https://tokyospinvault.com」を選択
4. Web Stream を選択して接続

重要: Measurement ID (G-XXXXXXXXXX) を必ずメモして報告してください。
B7 の GTM タグと、Shopify Customer Events の両方で使用します。

完了したら Measurement ID とスクリーンショットを撮ってください。
```

---

## B9: Shopify Customer Events に GA4 ピクセル追加

```
Shopify Admin にログインしてください。
URL: https://tokyo-spin-vault.myshopify.com/admin

Settings > Customer events に移動してください。

■ 目的
Shopify がホストするチェックアウトページ（Hydrogen ではなくShopify 側）で
purchase, begin_checkout などのイベントをGA4に送信するためのピクセルを設定します。

手順:
1. Settings > Customer events に移動
2. 「Add custom pixel」をクリック
3. Pixel name: GA4 Checkout Tracking
4. Permission: 「Not required」（コンセント設定は Hydrogen 側で管理済み）
5. 以下のコードを貼り付け:

--- ここからコード ---
// GA4 Measurement ID — B8で取得した ID に置き換えてください
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Load gtag.js
const script = document.createElement('script');
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
script.async = true;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', GA4_MEASUREMENT_ID);

// Track checkout events
analytics.subscribe('checkout_started', (event) => {
  gtag('event', 'begin_checkout', {
    currency: event.data?.checkout?.currencyCode || 'USD',
    value: parseFloat(event.data?.checkout?.totalPrice?.amount || '0'),
  });
});

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data?.checkout;
  if (!checkout) return;
  gtag('event', 'purchase', {
    transaction_id: checkout.order?.id || checkout.token,
    value: parseFloat(checkout.totalPrice?.amount || '0'),
    currency: checkout.currencyCode || 'USD',
    shipping: parseFloat(checkout.shippingLine?.price?.amount || '0'),
    tax: parseFloat(checkout.totalTax?.amount || '0'),
    items: (checkout.lineItems || []).map((item, i) => ({
      item_id: item.variant?.product?.id || '',
      item_name: item.title || '',
      price: parseFloat(item.variant?.price?.amount || '0'),
      quantity: item.quantity || 1,
      index: i,
    })),
  });
});

analytics.subscribe('payment_info_submitted', (event) => {
  gtag('event', 'add_payment_info', {
    currency: event.data?.checkout?.currencyCode || 'USD',
    value: parseFloat(event.data?.checkout?.totalPrice?.amount || '0'),
  });
});
--- ここまでコード ---

6. 「Save」をクリック
7. ステータスを「Connected」に変更

注意: GA4_MEASUREMENT_ID の 'G-XXXXXXXXXX' を B8 で取得した
実際の Measurement ID に必ず置き換えてください。

完了したらスクリーンショットを撮ってください。
```

---

## B10: 初回購入割引の設定

```
Shopify Admin にログインしてください。
URL: https://tokyo-spin-vault.myshopify.com/admin

Discounts に移動してください。

■ 自動割引の作成（初回購入 10% OFF）
1. Discounts > Create discount
2. 「Automatic discount」を選択
3. 設定:
   - Discount name: WELCOME10
   - Discount type: Percentage
   - Discount value: 10%
   - Applies to: All products
   - Minimum purchase requirements: No minimum
   - Customer eligibility: 新規ゲスト顧客のみに限定したい場合は
     「Specific customer segments」で「Customers who haven't purchased」を選択
     （このセグメントが利用可能な場合）
   - 利用可能でない場合は「All customers」のままで OK
   - Maximum discount uses:
     - 「Limit number of times this discount can be used in total」は OFF
     - 「Limit to one use per customer」を ON
   - Active dates: 開始を今日に設定
4. Save

■ 割引コードの作成（メルマガ登録用 15% OFF）
1. Discounts > Create discount
2. 「Discount code」を選択
3. 設定:
   - Discount code: VAULT15
   - Discount type: Percentage
   - Discount value: 15%
   - Minimum purchase requirements: Minimum purchase amount: $30
   - Limit to one use per customer: ON
   - Active dates: 開始を今日に設定
4. Save

これらの割引コードは以下で使用します:
- WELCOME10: 自動割引（カートで自動適用）
- VAULT15: メルマガ登録時のウェルカムメールで配布

完了したらスクリーンショットを撮ってください。
```

---

## B11: Google Merchant Center — フィード確認・再送信

```
Google Merchant Center にログインしてください。
URL: https://merchants.google.com/
Account ID: 5765860024

■ ステップ1: フィードの確認
1. Products > Feeds に移動
2. 既存のフィードが登録されているか確認
3. 登録されていない場合は「Add feed」をクリック:
   - Feed type: URL-based
   - Feed URL: https://tokyospinvault.com/feeds/products.xml
   - Feed name: Tokyo Spin Vault Product Feed
   - Fetch schedule: Daily（毎日自動取得）

4. 既存フィードがある場合は「Fetch now」で最新を取得

■ ステップ2: 診断確認
1. Products > Diagnostics に移動
2. エラー・警告を確認:
   - 「Missing GTIN」は現状想定内（JANコード未設定）
   - 「Price mismatch」があれば報告
   - 「Landing page error」があれば報告
   - 「Shipping mismatch」があれば報告

■ ステップ3: Free Listings 有効化
1. Growth > Free listings に移動
2. 有効になっていない場合は「Get started」をクリック
3. 対象国: US, GB, AU, CA すべてにチェック
4. 全商品がFree Listingsにオプトインされていることを確認

■ ステップ4: 配送設定の確認
1. Settings > Shipping and returns に移動
2. 以下の配送設定が正しいことを確認:
   - US: Free shipping, 7-14 business days
   - GB: Free shipping, 10-18 business days
   - AU: Free shipping, 5-12 business days
   - CA: Free shipping, 7-14 business days

不一致があればフィードとサイトの両方を確認して報告してください。

完了したらスクリーンショットを撮ってください。
```

---

## 実行順序のまとめ

1. **B1** → B2 → B3 (Shopify Admin 3設定、合計15分)
2. **B4** (GSC サイトマップ + インデックス登録、30分)
3. **B5** + **B6** (Bing + Pinterest、並行可、各10-15分)
4. **B8** → **B7** (GA4作成 → GTM設定、合計1-2時間)
   - B8 の Measurement ID を B7 に入力する順序
5. **B9** (Shopify Customer Events、B8の ID が必要、15分)
6. **B10** (割引設定、15分)
7. **B11** (GMC フィード確認、15分)
