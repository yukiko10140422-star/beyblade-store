import {Suspense} from 'react';
import {Await, Form, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {MenuIcon, SearchIcon, UserIcon, CartIcon} from '~/components/icons';
import clsx from 'clsx';
import {Wordmark} from '~/components/Wordmark';
import {SHELVES} from '~/lib/site';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

/**
 * Announcement bar (facts) + white header with a 1px rule: logo, shelves,
 * search, account, cart. No blur, no shadow.
 */
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {menu} = header;
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 bg-white border-b border-vault-700">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 md:h-[72px] md:gap-8 md:px-10">
          <HeaderMenuMobileToggle />
          <NavLink prefetch="intent" to="/" end className="shrink-0">
            <Wordmark />
          </NavLink>
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <div className="flex-1" />
          <DesktopSearch />
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </header>
    </>
  );
}

function DesktopSearch() {
  return (
    <Form
      method="get"
      action="/search"
      role="search"
      className="hidden h-10 w-56 items-center gap-2 rounded-[4px] border border-[#8F897D] bg-white px-3 focus-within:border-holo-500 focus-within:ring-2 focus-within:ring-holo-500/30 xl:flex"
    >
      <SearchIcon className="h-4 w-4 text-chrome-400" />
      <input
        type="search"
        name="q"
        placeholder="Search BX-, UX-, CX- numbers"
        aria-label="Search"
        className="w-full border-0 bg-transparent p-0 text-sm text-chrome-200 outline-none placeholder:text-chrome-600"
      />
    </Form>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const isMobile = viewport === 'mobile';

  return (
    <nav
      aria-label="Categories"
      className={clsx(
        isMobile ? 'flex flex-col py-2' : 'hidden items-center gap-5 lg:flex',
      )}
    >
      {isMobile && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          to="/"
          className="border-b border-vault-700 px-4 py-3 text-[15px] font-medium text-chrome-200"
        >
          Home
        </NavLink>
      )}
      {FALLBACK_HEADER_MENU.items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes('myshopify.dev') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              clsx(
                isMobile
                  ? 'border-b border-vault-700 px-4 py-3 text-[15px] font-medium'
                  : 'whitespace-nowrap text-sm font-medium hover:text-holo-500',
                isActive ? 'text-holo-500' : 'text-chrome-200',
              )
            }
          >
            {localizeMenuTitle(item.title)}
          </NavLink>
        );
      })}
      {isMobile && (
        <NavLink
          onClick={close}
          prefetch="intent"
          to="/account"
          className="px-4 py-3 text-[15px] font-medium text-chrome-200"
        >
          Account
        </NavLink>
      )}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <div className="-mr-2.5 flex items-center gap-1 md:gap-2">
      <SearchToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        aria-label="Account"
        className="hidden h-11 w-11 items-center justify-center text-chrome-200 hover:text-holo-500 md:flex"
      >
        <Suspense fallback={<UserIcon />}>
          <Await resolve={isLoggedIn} errorElement={<UserIcon />}>
            {() => <UserIcon />}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="-ml-2.5 flex h-11 w-11 items-center justify-center text-chrome-200 lg:hidden"
      onClick={() => open('mobile')}
      aria-label="Menu"
    >
      <MenuIcon />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="flex h-11 w-11 items-center justify-center text-chrome-200 hover:text-holo-500 xl:hidden"
      onClick={() => open('search')}
      aria-label="Search"
    >
      <SearchIcon />
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="relative flex h-11 w-11 items-center justify-center text-chrome-200 hover:text-holo-500"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-holo-500 px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

// Map Japanese menu titles from Shopify Admin to English
const MENU_TITLE_MAP: Record<string, string> = {
  ホーム: 'Home',
  カタログ: 'Collections',
  お問い合わせ: 'Contact',
  検索: 'Search',
};

export function localizeMenuTitle(title: string): string {
  return MENU_TITLE_MAP[title] || title;
}

/**
 * Shelf navigation from ~/lib/site. The Shopify `main-menu` is not used:
 * it links to old pages whose text no longer matches the facts.
 */
const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/fallback',
  items: SHELVES.map((s) => ({
    id: `nav-${s.handle}`,
    resourceId: null,
    tags: [],
    title: s.short,
    type: 'HTTP',
    url: `/collections/${s.handle}`,
    items: [],
  })),
};
