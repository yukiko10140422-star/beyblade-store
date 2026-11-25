import {useRouteLoaderData} from 'react-router';
import {type ShelfCounts, visibleShelves} from '~/lib/shelf-counts';
import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import clsx from 'clsx';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {COMPANY, EBAY_RECORD} from '~/lib/site';

const WRAP = 'mx-auto max-w-[1200px] px-4 md:px-10';

/** Hero: one plain headline, one sentence, two buttons, one photo beside it. */
export function HomeHero() {
  return (
    <section
      className={clsx(
        WRAP,
        'grid grid-cols-1 items-center gap-6 pb-8 pt-0 md:grid-cols-2 md:gap-12 md:pb-9 md:pt-11',
      )}
    >
      <figure className="order-first -mx-4 md:order-last md:mx-0">
        <img
          src="/images/hero-spin.jpg"
          alt="Beyblade X BX-52 starter, BX-10 stadium and CX-20 customize set"
          fetchPriority="high"
          className="block h-[150px] w-full border-vault-700 bg-white object-contain md:h-[320px] md:rounded-[4px] md:border"
        />
      </figure>
      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-[25px] font-bold leading-tight text-chrome-200 md:text-[38px]">
          Japanese Beyblade X, shipped from Japan.
        </h1>
        <p className="m-0 max-w-[30em] text-[14px] md:text-[17px]">
          Takara Tomy releases in their Japanese versions: starters, boosters,
          stadiums and event-limited items. Every product page shows the model
          number and when it ships.
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/collections/all-beyblades"
            prefetch="intent"
            className="flex h-[46px] items-center justify-center rounded-[4px] bg-holo-500 px-[22px] text-[15px] font-semibold text-white hover:bg-holo-600"
          >
            Shop new arrivals
          </Link>
          <Link
            to="/collections/pre-order"
            prefetch="intent"
            className="hidden h-[46px] items-center justify-center rounded-[4px] border border-[#8F897D] bg-white px-[22px] text-[15px] font-semibold text-chrome-200 hover:border-holo-500 sm:flex"
          >
            Pre-orders
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Category tiles (text only). */
export function CategoryTiles({
  title = 'Shop by category',
  as: Heading = 'h2',
}: {
  title?: string;
  as?: 'h1' | 'h2';
}) {
  const root = useRouteLoaderData('root') as
    | {shelfCounts?: ShelfCounts | null}
    | undefined;
  const shelves = visibleShelves(root?.shelfCounts);
  return (
    <section className={clsx(WRAP, 'pb-10 pt-2')}>
      <Heading className="mb-4 mt-0 text-base font-bold text-chrome-200 md:text-[22px]">
        {title}
      </Heading>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {shelves.map((s) => (
          <Link
            key={s.handle}
            to={`/collections/${s.handle}`}
            prefetch="intent"
            className={clsx(
              'flex flex-col justify-end gap-1 rounded-[4px] border border-vault-700 bg-white hover:border-holo-500',
              s.wide
                ? 'p-3 md:col-span-2 md:min-h-[120px] md:p-5'
                : 'p-3 md:p-[18px]',
            )}
          >
            <span
              className={clsx(
                'font-bold text-chrome-200',
                s.wide ? 'text-sm md:text-lg' : 'text-sm md:text-base',
              )}
            >
              {s.title}
            </span>
            <span className="hidden text-[13px] text-chrome-400 md:block md:text-sm">
              {s.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Product grid; hidden when there are no products. */
export function ProductGridSection({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Promise<ProductItemFragment[] | null>;
  viewAllHref: string;
}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={products} errorElement={null}>
        {(nodes) => {
          if (!nodes || nodes.length === 0) return null;
          return (
            <section className={clsx(WRAP, 'pb-9 pt-1')}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="m-0 text-base font-bold text-chrome-200 md:text-[22px]">
                  {title}
                </h2>
                <Link
                  to={viewAllHref}
                  prefetch="intent"
                  className="text-sm font-semibold text-holo-500 hover:text-holo-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                {nodes.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}

/** eBay record of the same team, with the date the numbers were read. */
export function EbayRecord() {
  const r = EBAY_RECORD;
  return (
    <section className={clsx(WRAP, 'pb-7')}>
      <div className="flex flex-col gap-4 rounded-[4px] border border-vault-700 bg-white px-[22px] py-[18px] md:flex-row md:items-center md:gap-9">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-chrome-200">Our record on eBay</span>
          <span className="text-[12.5px] text-chrome-400">
            We also sell on eBay as {r.sellerName}. As of {r.asOf}.
          </span>
        </div>
        <dl className="m-0 grid grid-cols-3 gap-4 md:flex md:gap-9">
          <Stat value={r.feedbackScore} label="feedback score" />
          <Stat value={r.positive} label={`positive, ${r.positivePeriod}`} />
          <Stat value={r.itemsSold} label="items sold" />
        </dl>
        <div className="hidden flex-1 md:block" />
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-holo-500 hover:text-holo-600 hover:underline"
        >
          See our eBay feedback
        </a>
      </div>
    </section>
  );
}

function Stat({value, label}: {value: string; label: string}) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-[13px] text-chrome-400">{label}</dt>
      <dd className="m-0 text-2xl font-bold text-chrome-200">{value}</dd>
    </div>
  );
}

/** Four facts, each with the page that explains it. */
export function FactsBand() {
  const facts = [
    {
      title: 'Japanese versions',
      body: 'Japanese releases, with the model number on the product page when it has one.',
    },
    {
      title: 'Ships from Japan',
      body: 'Japan Post ePacket or EMS, with tracking. Duties included — no extra charges on delivery (except the United Arab Emirates).',
      to: '/shipping',
      link: 'Shipping',
    },
    {
      title: 'Dispatch time',
      body: 'Pre-orders show the release date.',
      to: '/shipping',
      link: 'How ordering from Japan works',
    },
    {
      title: 'Run by XON, Yokohama',
      body: `Corporate number ${COMPANY.corporateNumber}.`,
      to: '/about',
      link: 'About us',
    },
  ];
  return (
    <section className="border-y border-vault-700 bg-vault-800">
      <div
        className={clsx(
          WRAP,
          'grid grid-cols-1 gap-5 py-7 sm:grid-cols-2 md:grid-cols-4 md:gap-6',
        )}
      >
        {facts.map((f) => (
          <div key={f.title} className="flex flex-col gap-1">
            <span className="font-semibold text-chrome-200">{f.title}</span>
            <span className="text-sm">{f.body}</span>
            {f.to && (
              <Link
                to={f.to}
                prefetch="intent"
                className="text-[13px] text-holo-500 hover:text-holo-600 hover:underline"
              >
                {f.link}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
