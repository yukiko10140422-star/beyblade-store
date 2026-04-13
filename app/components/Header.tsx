import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import clsx from 'clsx';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-vault-950/95 backdrop-blur-md border-b border-gold-400/10">
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <NavLink
          prefetch="intent"
          to="/"
          end
          className="flex-shrink-0 flex items-center gap-3"
        >
          <img src="/images/logo.png" alt={shop.name} className="h-12 w-auto" />
        </NavLink>

        {/* Desktop Navigation */}
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        {/* CTAs */}
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
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
      className={clsx(
        'flex',
        isMobile ? 'flex-col gap-1 py-4' : 'hidden md:flex items-center gap-8',
      )}
      role="navigation"
    >
      {isMobile && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          to="/"
          className={({isActive}) =>
            clsx(
              'font-heading text-sm uppercase tracking-widest py-3 px-4 rounded-lg transition-colors',
              isActive
                ? 'text-gold-400 bg-gold-400/5'
                : 'text-chrome-300 hover:text-gold-400 hover:bg-vault-800',
            )
          }
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url =
          item.url.includes('myshopify.com') ||
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
                'transition-colors duration-200',
                isMobile
                  ? clsx(
                      'font-heading text-sm uppercase tracking-widest py-3 px-4 rounded-lg',
                      isActive
                        ? 'text-gold-400 bg-gold-400/5'
                        : 'text-chrome-300 hover:text-gold-400 hover:bg-vault-800',
                    )
                  : clsx(
                      'font-heading text-xs uppercase tracking-[0.15em]',
                      isActive
                        ? 'text-gold-400'
                        : 'text-chrome-400 hover:text-gold-400',
                    ),
              )
            }
          >
            {localizeMenuTitle(item.title)}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex items-center gap-1 md:gap-3" role="navigation">
      <HeaderMenuMobileToggle />
      <SearchToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-chrome-400 hover:text-gold-400 hover:bg-vault-800 transition-colors"
      >
        <Suspense fallback={<UserIcon />}>
          <Await resolve={isLoggedIn} errorElement={<UserIcon />}>
            {() => <UserIcon />}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-chrome-400 hover:text-gold-400 hover:bg-vault-800 transition-colors"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-lg text-chrome-400 hover:text-gold-400 hover:bg-vault-800 transition-colors"
      onClick={() => open('search')}
      aria-label="Search"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L17 17" />
      </svg>
    </button>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="7" r="3" />
      <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-chrome-400 hover:text-gold-400 hover:bg-vault-800 transition-colors"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={`Cart (${count} items)`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M6 6h12l-1.5 7H7.5L6 6z" />
        <path d="M6 6L5 2H2" />
        <circle cx="8" cy="17" r="1.5" fill="currentColor" />
        <circle cx="15" cy="17" r="1.5" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-vault-950 text-[10px] font-heading font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
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

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
