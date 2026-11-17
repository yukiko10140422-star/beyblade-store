# eBay (ninjapon) ⇔ Shopify (3 つの Vault) の取込と在庫連動 — 設計

2026-11-17 作成。道具は `scripts/ebay-shopify/` にある。`scripts/` は .gitignore の対象なので、道具そのものは git に入らない。
この文書だけを git で管理する。

## 0. 前提

- Shopify は **1 つのストア** (`tokyo-spin-vault.myshopify.com`) です。在庫の拠点も 1 つです (「辻堂 6-13-14」)。
  3 つのサイトは掲載先 (publication) が違うだけです。
  - `Tokyo Spin Vault`: ベイブレード
  - `Tokyo Card Vault`: ワンピースカード・ポケカ・旧裏
  - `Tokyo Character Vault`: ぬいぐるみ・フィギュア等
  → **Shopify の商品 1 件の在庫は 1 つです。どのサイトで売れても同じ在庫が減ります。**
- eBay の数量は、Nexsus の在庫監視 (仕入先の在庫切れ → eBay の数量 0、OOSC) が動かしています。
  **在庫の正は eBay の数量**で、Shopify はそれに従います。
- eBay への書き込み (数量を減らす) は**まだ行いません。** 道具は「減らす必要がある一覧」を出すだけです。実行はユーザーの承認後です。
- Trading API は全アカウント共有で 5,000/日です。Browse は使いません (主 keyset の残りが床 1,500 を割っているため)。
  道具は Browse の URL を呼ぶと例外で止まります (`lib/nexsus-bridge.mjs`)。

## 1. 紐付け (1 対 1)

| eBay | Shopify |
|---|---|
| 商品番号 (ItemID) | メタフィールド `ebay.item_id`、タグ `ebay-<商品番号>` |
| SKU (custom label) | メタフィールド `ebay.sku` |
| — | variant の SKU = **`EBAY-<商品番号>`** (常にこの形) |
| 出品開始日 | `ebay.start_time` (GetSellerList の窓を作るのに使う) |
| 掲載したいサイト | `ebay.intended_store` とタグ `store:tokyo-card-vault` 等 |

Shopify の SKU を eBay の SKU と同じにしない理由: eBay の SKU は複数の出品で同じ値を使い回していることがあります
(例: `KEN` が BX-53 と BX-52 の両方に付いている)。これでは 1 対 1 になりません。商品番号は一意です。

### Nexsus から読める紐付け表 (案。migration はまだ本番に適用しない)

**案 A (推奨): 新しい表 `shopify_listing_links`**

```sql
create table public.shopify_listing_links (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  ebay_account_id     uuid not null references public.ebay_accounts(id),
  ebay_item_id        text not null,                 -- eBay 商品番号
  ebay_sku            text,                          -- eBay の custom label (共有されていることがある)
  shopify_product_id  text not null,                 -- gid://shopify/Product/...
  shopify_variant_sku text not null,                 -- EBAY-<商品番号>
  shopify_inventory_item_id text not null,
  shopify_status      text not null,                 -- DRAFT / ACTIVE / ARCHIVED
  sites               text[] not null default '{}',  -- 掲載中のサイト (Tokyo Card Vault 等)
  intended_site       text not null,                 -- 取込時に決めた店
  qty_cap             integer not null default 5,
  last_ebay_remain    integer,                       -- 最後に読んだ eBay の残り
  last_shopify_qty    integer,                       -- 最後に合わせた Shopify の数
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (ebay_account_id, ebay_item_id),
  unique (shopify_product_id)
);
create table public.shopify_ebay_decrements (           -- Shopify で売れて eBay を減らす必要があるもの
  id               uuid primary key default gen_random_uuid(),
  link_id          uuid not null references public.shopify_listing_links(id),
  shopify_order    text not null,                       -- #1040
  units            integer not null check (units > 0),
  status           text not null default 'pending' check (status in ('pending','approved','done','cancelled')),
  ebay_qty_before  integer,
  ebay_qty_after   integer,
  done_at          timestamptz,
  unique (shopify_order, link_id)
);
-- RLS は autolist_listings と同じく organization_id で絞る
```

**案 B (不採用): `autolist_listings` に列を足す**
- 出品台帳には、売れ筋の多くが載っていません。2026-11-17 の実測では、直近 180 日に売れたベイブレード 128 件のうち 99 件が台帳にありませんでした。台帳に無い出品は紐付けられません。
- 台帳の 1 行は「仕入先 1 つ」に対応しています。販売チャネルの情報を混ぜると、在庫監視の計器が読む表が太ります。

**今の暫定**: 紐付けの正は Shopify のメタフィールドです。`sync-stock.mjs` が毎回そこから読みます。
減らす必要がある一覧は `data/ebay-shopify/ebay-decrement-todo.json`、反映済みの記録は `data/ebay-shopify/ebay-decrement-ledger.json` にあります。
表ができたら、`sync-stock.mjs` が上の 2 表にも書きます。

## 2. 在庫の流れ

### (a) eBay → Shopify (道具 `sync-stock.mjs`、`--apply` で Shopify だけ書く)

```
Shopify 在庫 = min( eBay 残り − まだ eBay に反映していない Shopify の販売数 , 上限 qty_cap )
eBay が終了 (Completed/Ended) または残り 0 → 0
eBay が読めない (窓に無い・API 失敗)       → 触らない (fail-closed。0 にしない)
```

- **上限 (`--qty-cap`、既定 5)**: 無在庫出品では eBay の数量が 107 や 181 になっているものがあります。仕入先の在庫と関係のない数なので、Shopify にはそのまま出しません。
- **「まだ eBay に反映していない Shopify の販売数」を引く理由**: Shopify で売れても、eBay の数量が減るまでは eBay の残りはそのままです。引かないと、次の連動で Shopify の在庫が元に戻り、同じ物をもう一度売ってしまいます。

### (b) Shopify で売れた → eBay を減らす (今は一覧を出すだけ)

- 取消された注文は除きます。紐付いていない旧商品の注文 (#1005 など) は対象外です。エラーにはしません。
- 1 行に入るもの: 注文名・eBay 商品番号・個数・今の eBay 残り・提案 (`Quantity 11 → 10`)。
- ユーザーが eBay に反映したら `--mark-done=#1040:227525294694` で記録します。記録した行は二度と出ません。

## 3. 何分おきか・どちらが正か・売れた直後の取り合い

| 事象 | 反映までの時間 (案) | 方法 |
|---|---|---|
| eBay で売れた / 仕入先の在庫切れで eBay が 0 になった | **10 分以内** | Trading `GetSellerEvents` (ModTimeFrom = 前回) で、変わった出品だけを取る。1 回 1 コールなので 1 日 144 コール |
| Shopify で売れた | **すぐ** (Shopify の在庫は自動で減る) → eBay は承認後 | 将来は Shopify の `orders/create` webhook で、承認済みのルールに従って eBay `ReviseInventoryStatus` |
| ずれの総点検 | 1 日 1 回 | `sync-stock.mjs` (GetSellerList の SKU 絞り込み + SKU の無い出品は GetItem) |

**取り合い (二重販売) が起きる窓**:
- eBay で最後の 1 個が売れてから、Shopify が 0 になるまでの時間です。上の案では最大 10 分です。
  この間に Shopify でも売れると 1 個足りなくなります。
  - 対策 1: eBay の残りが 1 の出品 (一点物・フリマ仕入れ) は、Shopify の上限を 0 にする。または Shopify に出さない。**未決です。**
  - 対策 2: eBay の Platform Notifications (`ItemSold` / `FixedPriceTransaction`) を受けて即時に 0 にする。受け口 (Nexsus の API ルート) が必要です。
- Shopify で売れてから eBay が減るまで: 今は人の承認待ちなので、数時間になりえます。
  この間 eBay ではまだ買えます。仕入れ可能な在庫がある商品なら、仕入れで吸収できます。一点物は危険です。
  → 一点物を Shopify に出すかどうかが一番大きな未決事項です。

**正**: 数量の正は eBay です。Nexsus の在庫監視が仕入先を見て eBay を動かします。
Shopify は「eBay の残り − 未反映の Shopify 販売」を上限つきで写すだけです。
Shopify の在庫を人が手で増やしても、次の連動で eBay 基準に戻ります。

## 4. スケジューラの登録案 (登録はしない。承認はユーザー)

```
タスク名: NexsusShopifyStockSync
動作:     node C:\Users\k3n70\Desktop\プロジェクト\beyblade-store\scripts\ebay-shopify\sync-stock.mjs --apply --trading-cap=40
間隔:     1 日 1 回 (総点検)。GetSellerEvents 版を作ったら 10 分おきの別タスク
機械:     母艦 (eBay の token と Nexsus の .env がある)。日次チェーン (07:00〜) とミラー日次 (09:00〜) の時間を避ける
```

- `exit 0` は健全の証拠ではありません。出力の「変更 / 変更なし / 読めず」の件数を見ます。「読めず」が多い日は止めます。

## 5. 取込 (`import-from-ebay.mjs`) の判定

除外の理由ごとに件数を出します:
- 出品台帳に無い
- 読めず (終了とは読まない)
- 出品中でない
- 固定価格でない
- バリエーション
- USD 以外 (海外サイトの自動複製)
- 数量 0
- カテゴリ違い
- アダルト
- 予約品で時期が読めない
- 既にある
- 写真が無い

- 説明は eBay の説明を掃除して使います。落とすもの:
  - 店への導線・売れ筋の区画
  - 隠し schema 段
  - DDU 注記
  - eBay の支払い・配送・返品の定型文
  - ebay.com へのリンク
  型番・状態・原産国は足しません (FM10)。
- ランダム封入は、eBay の題か説明に「選べない」とはっきり書いてある時だけ、先頭に写します。
  "Random Booster" という商品名だけでは足しません。6 種の FULL SET も同じ名前で出ているためです。
- 予約品は、eBay の題・説明に発売日か発送時期が残っているものだけを取り込みます。
- 写真: 末尾の共通画像 (店の案内) は外します。1 枚目に NINJAPON ロゴが焼かれているかを記録します。
- Shopify には **DRAFT で作り、どの掲載先にも出しません。** 公開は `tsv.mjs publish <handle> --site=<店>` で人が行います。

## 6. 未決事項 (ユーザーが決める)

1. **価格**: 案 A は eBay と同額です (eBay も Shopify も送料無料なので、着地の総額も同じ)。案 B は手数料の差を反映して下げる案で、約 −16% です。
   案 B の計算は、eBay 手数料 20% と Shopify Payments 3.9% + $0.30 を前提に、eBay の手取りと同じになる価格です。
   道具では `--price=same|fee` で選びます。
2. **一点物 (eBay の残り 1) を Shopify に出すか**: 出す場合は、即時通知 (§3 の対策 2) が要ります。
3. **在庫の上限**: 今は 5 です。
4. **eBay への数量の書き戻し**を自動にするか、承認制のままにするか。
5. **紐付け表**: 案 A の migration を作るか。
6. **出品台帳に無い出品**:
   - カード 84 件・キャラ 253 件。今は除外しています。spin は GetItem で読んで含めています。
   - これらは在庫監視につながっていません。Shopify に出すなら、先に台帳への登録 (Nexsus の register) を行うのが筋です。
7. **ハンドリング日数**: eBay の多くの出品は発送まで 20 日です。Shopify のサイトは「7〜14 日で届く」と案内しています。予約品・無在庫品の書き方を揃える必要があります。

## 7. 実測 (2026-11-17) と既知の穴

**下見の件数** (ミラー出品と一点物の関門を入れた後。関門を外す時は `--allow-mirror` / `--allow-single`):

| 店 | 候補 | 取り込み対象 | 判断待ち: ミラー | 判断待ち: 一点物 | 主な除外 |
|---|---|---|---|---|---|
| Card | 243 | 21 | 17 | 12 | 数量0 92・台帳に無い 84・出品中でない 7・ポケモン/ワンピース以外 5 |
| Character | 1,110 | 120 | 165 | 8 | 数量0 414・台帳に無い 253・キャラの手がかりなし 57・読めず 54・食器/対象外カテゴリ 20 |
| Spin | 170 | 69 | 24 | 14 | 数量0 33・USD 以外 7・出品中でない 6・バリエーション 5・既にある 8・予約で時期なし 4 |

- **Spin の母数は全件ではない**: Spin の候補は「出品台帳 (active + soldout)」と「直近 180 日に売れたベイブレードの商品番号」の和集合です。
  台帳にも無く 180 日売れていない出品は数えていません。全件を確かめるには、GetSellerList の全走査がおよそ 240 コール要ります (ユーザー判断)。
- **ミラー出品**には次のような問題があります。ライバル (ミラー元) の写真をそのまま使っていて、PKC は相手の店の写真です。item specifics が題と食い違うことがあります (Charizard で実際に見つかった)。在庫はライバル次第です。
  道具は、題のカード番号と欄の番号が違う時は `card.card_number` と `card.set_name` を書きません。
  **ミラー出品を Shopify に出すかどうかはユーザーが決めます。**
- **写真のロゴ**: 1 枚目に NINJAPON ロゴが焼かれている商品が多くあります。試しの 10 件では、カード 2 件とキャラ 2 件 (Celebi / Nico Robin / Tamagotchi / Mimikyu) が該当します。
  2 枚目以降はどの商品も eBay の写真のままです。Google Merchant Center の基準 (ロゴ・透かしを重ねない) に合いません。
  Spin の 1 枚目だけは、切り抜きでロゴを消しています。
- **1 枚目の加工で、自動で見抜けない形がある**:
  - BX-53 は元写真に机・壁の背景があります。切り抜きが崩れて「余白を足すだけ」に切り替わったため、背景と焼き込みロゴがそのまま残りました。
    背景の明暗の判定は、元写真の外周の白い余白を見て「明るい」と誤認しました。
  - BX-52 は、写真の中の実物の「NinJapon」の札が商品と接していて残りました。
  → 全件の前に、処理後の見本を人が見る運用が必要です。
- **Trading の消費**: 今回は 2,296 → 1,695 で、約 600 コール (他セッションの分を含む)。
  大半は、Spin の台帳に無い出品を GetItem で 1 件ずつ読んだ分です (99 件 × 2 回)。今は 6 時間の置き場があるので、2 回目からは減ります。
  全件を作る時は、作る直前に GetItem で取り直すので 1 件 1 コールかかります (Spin 108 件なら 108 コール)。
- **在庫連動 1 回の見込み**: GetSellerList は開始日の窓 × SKU 100 件ごとに 1 コールで、全件 (約 450 件) で 10〜20 コールです。
  これに eBay の SKU が無い出品が 1 件 1 コール加わります (Spin で 5 件)。
  GetSellerEvents 版はまだ作っていません (§3 は設計だけ)。
- **(b) と「未反映の Shopify 販売を引く」計算は、実際の Shopify 注文ではまだ動かしていません。** `sync-stock.mjs --self-test` の 8 件 (純関数) だけを確かめました。
  未反映の販売は `ebay-decrement-ledger.json` に残ります。注文が窓 (`--order-days`) から外れても引き続き引きます。

## 8. 追加の未決事項

8. **ミラー出品** (Card 19 / Character 165 / Spin 24) を Shopify に出すか。
9. **米国の関税は誰が払うか** (ePacket Light の注文の場合)。Spin Vault は「関税込み」と案内しています。案 B (手数料差だけを反映して下げる) は、関税の差を見ていません。
10. **ロゴ入りの写真をどうするか**: 元の写真を撮り直す / ロゴの無い写真に差し替える / 2 枚目以降も加工する。

## 9. 監査 (honest-auditor、2026-11-17) で直したことと残り

**直した**:
- C-1: 説明に eBay の返品・発送日数・配送便の文言が残っていた。段 (p / li / td / div / span) ごとに取引条件の語で落とすようにした。置き場の 2,382 件では、残りが 0 件になった (`scan-descriptions.mjs`)。作成時の読み戻しに `noEbayTerms` を足し、既存の DRAFT 10 件を作り直した (`check-drafts.mjs`: 10/10 OK)。
- H-1/H-2: ミラー出品と一点物を、既定で除外する関門にした。
- H-4: 店の案内画像の検査ができない時は、作らないようにした。
- H-5: 在庫の書き込みを比較つき (読んだ時の数のままなら書く) にした。1 件ずつ try にした。
- H-6: 状態・数量が読めない eBay の応答を 0 にしない。
- H-7: 紐付け 0 件・読めず・書き込み失敗があれば、終了コードを 2 にする。
- H-8: `--refresh` で消す欄を、この道具が書く欄に限った。先に書いてから消す順にした。
- M-1: 作る直前の GetItem の値で、題・説明・写真・価格も作り直す。
- M-3: 題と欄のカード番号が食い違う時は、rarity / grade / cert と eBay の欄の写しも書かない。

**試しの DRAFT で、関門より前に作ったもの**: ミラー 3 件 (Charizard = CTH、Nico Robin = DKD、UX-21 = PKC) と、一点物 3 件 (カード 3 件)。消すかどうかはユーザーが決める。

**残り**:
- H-3: Spin は、出品台帳に無い出品 (在庫監視なし) も含めている。
- H-9: 付属品の欠けは目視が必要。
- M-2: 全額返金で個数 0 になった行、30 日を過ぎてからの取消、同じ注文に同じ商品が 2 行ある場合を扱えていない。
- M-4: 予約の時期の判定がゆるい (過去の日付・"1/7 scale")。
- M-5: 送料が 0 でない出品を見ていない。
- M-6: ninjapon の判定が JSON の部分一致。
- M-7: DRAFT の作成がひとまとまりでない。
- 比較つきの書き込みは、まだ実際の変更で動かしていない。

## 10. 写真の NINJAPON ロゴを外す (2026-11-17 ユーザー指示)

- 対象: Shopify に取り込む写真の全部 (1 枚目も 2 枚目以降も、3 店すべて)。eBay の写真は触りません。手元の写しを加工します。処理はサブ機 (`logo-remove.py`、OpenCV) で行います。
- 検出:
  - Nexsus `brand-logo.mjs` と同じ位置 (右下、幅 × 0.12) を、同じ規則 (平均差 24 以下) で見ます。
  - その位置に無ければ、右下 45% を大きさを変えて探します (テンプレート照合)。探した時は平均差 45 以下で「ある」と判定します。
    - 正方でない写真ではロゴの位置がずれ、画面の外にはみ出していることがあります (BX-52 で実際にあった)。
- 外し方 (写真ごとに記録):
  - `fill`: 周りが単色なので、その色で塗った
  - `inpaint`: 周りの模様から埋めた
  - `crop-bottom` / `crop-right`: ロゴが商品にかかっているので塗らず、ロゴの帯を切り落とした
  - `drop`: 切り落とすと商品が欠けるので、その写真を使わない。1 枚目が drop なら次の写真を繰り上げる
- 見本と一覧: `data/relist-preview/logo-removal/<eBay商品番号>/` と `summary.json`。
- 写真に写っている実物の「NinJapon」の札 (BX-52 / BX-53 の撮影小物) は、焼き込みではないので外せません。撮り直しか、別の写真への差し替えが要ります。
- `inpaint` は、周りが複雑だと薄い汚れが残ります (Celebi の木目の縁など)。公開前に見本を目で見てください。

## 11. 配送の速さ (eBay と同じ — 2026-11-17 ユーザー指示)

- Shopify のメタフィールドに書くもの (eBay の値を写すだけ):
  - `shipping.handling_days` (整数、営業日) = eBay の DispatchTimeMax
  - `shipping.service` = 米国向けの便 (eBay の ShippingServiceOptions の 1 つ目)。表にある便は人が読む名前を付ける (例 `SpeedPAK Economy (US_EconomySppedPAK)`)。表に無い便はコードのまま
  - `ebay.shipping_profile` = eBay の配送ポリシー名
- 定義 (`shipping.handling_days` / `shipping.service`) は Storefront から読める公開設定です。依頼時点で既に作られていました。
- 在庫連動 `sync-stock.mjs` は、eBay との差を (c) として表示するだけで、書き込みはまだしません。
- **食い違いがあります**: 配送ポリシー名の日数と DispatchTimeMax が合わない出品があります。例: UX-21 はポリシー名が「5日」なのに DispatchTimeMax は 20。道具は DispatchTimeMax を正とします。
  また、eBay の便は SpeedPAK (Orange Connex) です。ユーザーの前提 (日本郵便の eパケット / EMS) とどう対応させるかは未決です。

## 12. 速達 (eBay と同じに) — 調査と案 (設定は変えていない)

### 調べたこと (2026-11-17、読み取りのみ)

**eBay の配送ポリシー**: ninjapon には 26 本あります。米国の買い手が追加料金を払って速くする選択肢は、どのポリシーにもありません。
- 米国あては無料の SpeedPAK Economy / Expedited で、国外の Expedited は $23〜25 です。
- 名前に「Expedited」と付いていても、米国あての中身が Economy のポリシーが 6 本あります。

**eBay の速達は別出品で売っています**:

| 商品番号 | タイトル | 価格 | 売れた数 (直近 180 日) | 1 注文の個数 |
|---|---|---|---|---|
| 227511524398 | Additional cost for Expedited Shipping | $25 のみ | 283 件 | ほぼ 1 個 (2 個の注文が 1 件) |
| 226501134932 | 〃 and priority preparing | 主に $20 | 128 件 (改名前の分が別に 15 件) | 1 個 |

- 後者は 09-14 を最後に売れていません。
- **どちらの説明文も、発送までの日数や配送方法 (EMS) を約束していません。**
- 付け先の決まり (memory): 未発送が 1 件ならそれに付ける。予約品と通常品なら通常品を先にする。お客様の指定に従う。
- 速達を使ったかは、本体の追跡番号が EN (EMS) かで判断します。
- 料金は重さ・地域で変わらず、$25 一本です。

**日本郵便の公式料金** (米国 = 第 4 地帯):

| 重さ | EMS | 国際エアパケット |
|---|---|---|
| 0.5kg | ¥3,900 | ¥2,040 |
| 1kg | ¥5,300 | ¥3,090 |
| 2kg | ¥7,900 | ¥5,190 |

- 国際eパケットライトは、2026-06 に「国際エアパケット」へ名前が変わりました。
- 米国あての EMS 実費 (367 個) は中央値 ¥5,300、重さの中央値 999g でした。
- 米国あての公式のお届け日数は取れていません (要確認)。

**Shopify の今の設定**:
- 8 ゾーンすべてで、速い便を「DHL/FedEx」と書いています。標準は「ePacket Light」という旧名のままです。
- 米国の Express は $22 で、EMS の実費 (0.5kg でも ¥3,900 ≒ $24.4) より安くなっています。
- $300 以上か 3 点以上で Express が無料になります (上限 $55)。eBay の速達には無料の条件がありません。
- 料金は全部定額で、重さの条件はありません。

### 案

1. **便の名前を変える**: 「Standard: Japan Post International Air Packet (tracked) — 旧 ePacket Light」と「Express: Japan Post EMS (tracked)」にします。DHL/FedEx の表記をやめ、自動割引 2 件の名前と文言も EMS に合わせます。
2. **料金**: eBay の $25 は、EMS とエアパケットの差額 (0.5〜2kg で ¥1,860〜2,710) を賄っています。そこで Shopify の Express も「上乗せ $25」を基本にします。
   - 重さで差を付けるなら、配送プロファイルに重さの条件を付けた料金表 (0〜1kg / 1〜2kg / 2kg〜) を作ります。この時は商品の重さの登録が前提で、今の DRAFT は重さが空です。
   - ゾーンは日本郵便の地帯 (第 1〜第 5) に合わせて分け直します。今の North America には第 3 地帯の CA・MX と、第 4 地帯の US が混ざっています。
3. **2 段の速達**:
   - 「Express (Japan Post EMS)」と「Express + priority handling」を、チェックアウトの配送方法として作るのを推奨します。1 注文で完結し、付け先を決める手間が無く、ゾーン・重さで料金を変えられるためです。
   - eBay と同じく、カートに入れる追加商品で作る案もあります。ただし重さ・地域で料金を変えられず、付け先を決める手間も残ります。
   - **払った人の発送日数は、eBay に約束の記載が無いので未決です (ユーザーが決める)。**
4. **無料の条件** ($300 以上 / 3 点以上で Express 無料) は eBay に無いので、外すか上限を見直す案です。米国 2kg なら EMS の約 ¥7,900 がまるごと店の負担になります。
5. **商品ページに出すメタフィールド案** (道具から eBay の値で書ける):
   - `shipping.handling_days` / `shipping.service`: 作成済み
   - `shipping.standard_label` = "Japan Post International Air Packet (tracked)"
   - `shipping.express_label` = "Japan Post EMS (tracked)"
   - `shipping.express_price_usd` = 25 (eBay の速達出品の価格)
   - `shipping.express_handling_days`: 未決
   - 文の形: 「Ships within {handling_days} business days. Standard: Japan Post Air Packet (tracked). Express: Japan Post EMS (tracked), +${express_price_usd}.」
6. **速達の 2 出品は商品一覧に出しません**: 取込の対象外です (`SERVICE_RE` で除外済み)。

## 13. 価格の決まり (2026-11-17 オーナー決定) と下限の安全装置

**価格** = eBay の売値から約 −16% (案 B: 手数料差。式は §6)。ただし下限を下回る時は下限の価格にします (eBay の売値より高くなることもある)。
**原価が分からない商品は作りません** (一覧の「原価不明 (作らない)」)。

**下限** (USD。P = Shopify の価格、関税は店が払う DDP):

```
P × (1 − Shopify 決済率 − 関税率 − Zonos 率) − Shopify 固定 − Zonos 固定 ≥ (原価 + 送料 + 最低利益) ÷ 為替
P_min = ((原価 + 送料 + 最低利益) ÷ 為替 + 0.30 + 1.69) ÷ (1 − 0.039 − 関税率 − 0.0126)   … .99 に切り上げ
```

| 項目 | 値 | 出どころ |
|---|---|---|
| 為替 | 直近 200 注文の `orders.exchange_rate` の中央値 −2% (11-17: 155.12 円) | Nexsus orders |
| 原価 | 仕入れ実績 (procurement_purchases、同じ eBay 商品番号の直近 5 件) の中央値と、出品台帳の仕入値 (`source_price_jpy`) の**高い方** | 無ければ作らない |
| 送料 | ① 商品ごとの見込み表 (`nexsus/data/item-shipping-estimates.json`) → ② 同じ商品の発送実績 (shipment_records、1 個の注文) の中央値 → ③ 重さ (台帳の `ship_weight_g` → eBay の荷物の重さ) から日本郵便の公式料金 → ④ 目安 = 同じ店の候補の送料の中央値 → ⑤ 目安 ¥3,090 | 補正: エアパケットの Zonos 額に特定記録 +370 円。額が空なら重さから計算 |
| 日本郵便の公式料金 (第 4 地帯 米国) | エアパケット 100g ¥1,200 + 100g ごとに ¥210 (2kg まで、特定記録込み) / EMS 0.5kg ¥3,900・1kg ¥5,300・1.5kg ¥6,600・2kg ¥7,900 | post.japanpost.jp (§12) |
| 関税率 | 同じ商品の実績 (`customs_duty_usd ÷ sale_price_usd`、1 個の注文) の 75% 点。ただし 10% を下回らせない。実績が無ければ 15% | トイ (9503) の実績は約 12.5% |
| Shopify 決済 | 3.9% + $0.30 | 海外カード想定の保守値 |
| Zonos | 1.26% + $1.69 | 11 月の `customs_fee_usd` の実測を直線で近似 |
| 最低利益 | ¥300 | 既存の値下げの規則と同じ |

- 作る時は、作る直前の eBay の価格で計算し直します。
- 下限の計算は**全件をまとめて**行います。④ の「同じ店の候補の中央値」は候補全体から作るので、`--only` で数件だけ作ると値が変わることがあります。
- 率は `scripts/ebay-shopify/lib/price-floor.mjs` の `RATES` にあります。直したら、この表も直します。

## 14. 配送の表示 (オーナー決定: 日本郵便で統一)

- メタフィールド `shipping.service` には **eBay の実値** (SpeedPAK 等) を、そのまま残します。在庫連動で eBay と比べるためです。
- サイトの表示は**全商品共通の文言**とし、商品ごとのメタフィールドではなく、サイト側 (テーマ / Hydrogen) の定数で出す案です。
  - Standard: Japan Post ePacket (tracked)
  - Express: Japan Post EMS (tracked) +$25
  - Express + priority handling: ships within 5 business days +$45
- 発送までの日数 (`shipping.handling_days`) は、商品ごとに eBay の値を出します。
- site 担当と揃える事項: 表示用のメタフィールドを作らず、サイトの定数で持つこと。

## 15. 商品の重さ (2026-11-17 オーナー決定)

重さは `lib/weight.mjs` と `fix-weights.mjs` で決め、どれを使ったかを `shipping.weight_source` に書きます。上から順に使います。

1. **実績**: Nexsus の発送記録 `shipment_records.weight_g` (Zonos / Ship&co が実際に送った時の重さ、梱包込み)。同じ eBay 商品番号の、1 個だけの注文の中央値を使います。
   - `orders.actual_weight` は課金重量 (容積重量を含む) なので使いません。
2. **推定**: eBay の出品の荷物の重さ + 100g (梱包分)。
3. **推定**: eBay の重さが未入力 (0) なら、出品台帳の発送重量 `autolist_listings.ship_weight_g` + 100g。
   - これはオーナー決定の 2 段に足した段です。eBay の重さは未入力が多いためです。
4. **不明**: どれも無い時は重さを付けません (推測しない)。
   - **重さが無い商品も公開してよい** (オーナー決定 11-17:「重さがなくても eBay で出せていれば送料は計算されているのでいい」)。重さは空のままにし、推測で入れません。

**11-17 の内訳**:

| 店 | 実績 | 推定 (eBay + 100g) | 推定 (台帳 + 100g) | 不明 |
|---|---|---|---|---|
| Spin | 15 | 0 | 15 | 34 |
| Card | 3 | 2 | 19 | 0 |
| Character | 28 | 7 | 85 | 2 |

- 作る時にも同じ規則で重さを付けます (`import-from-ebay.mjs` の create)。

## 16. 製品識別子

- EU 27 か国を配送先から外したので、識別子の確認は止めました (オーナー、11-17)。
- 途中まで写した barcode / `product.mpn` は残っています。対象は Spin・Card の一部です。
- `lib/identifiers.mjs` と `fix-identifiers.mjs` は残してありますが、取込からは呼びません。

## 17. 公開 (2026-11-17 オーナー「公開していいよ」)

- 取込の 210 件を ACTIVE にし、それぞれの店の掲載先**だけ**に公開しました (`publish-vault.mjs`)。

  | 店 | 件数 |
  |---|---|
  | Spin | 64 |
  | Card | 24 |
  | Character | 122 |

  Online Store など、他の掲載先には出していません。
- Spin の旧商品 30 件は削除していません。Tokyo Spin Vault の掲載先から外しました (掲載中だった 28 件)。
  - 公開後の Storefront 確認で、旧 28 件が **Tokyo Card Vault と Tokyo Character Vault にも掲載されていた**ことが分かりました。こちらからも外しました (`unpublish-old-from-vaults.mjs`)。
  - Online Store・Shop・Pinterest の掲載はそのままです。
  - 未発送の注文には触れていません。
- 変更はすべて `data/tsv-changes.jsonl` に記録しています。`node scripts/tsv.mjs undo <ID> --apply` で 1 件ずつ戻せます。
- 確認 (`check-storefronts.mjs`、各サイトの Storefront トークン): 3 店とも、自店の商品だけが見え、件数が一致しました (64 / 24 / 122)。旧商品は 0 件です。
