import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import clsx from 'clsx';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-vault-950 border-t border-gold-400/10 mt-auto">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="md:col-span-1">
                  <img
                    src="/images/logo.png"
                    alt="Tokyo Spin Vault"
                    className="h-16 w-auto mb-4"
                  />
                  <p className="text-chrome-500 text-sm leading-relaxed">
                    Premium authentic Beyblades sourced direct from Japan.
                    Collector grade. Vault sealed.
                  </p>
                </div>

                {/* Shop Column */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
                    Shop
                  </h3>
                  <ul className="space-y-3">
                    <FooterLink to="/collections">All Collections</FooterLink>
                    <FooterLink to="/collections/all">All Products</FooterLink>
                  </ul>
                </div>

                {/* Info Column */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
                    Information
                  </h3>
                  {footer?.menu && header.shop.primaryDomain?.url && (
                    <FooterMenu
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain.url}
                      publicStoreDomain={publicStoreDomain}
                    />
                  )}
                </div>

                {/* Newsletter Column */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
                    Vault Access
                  </h3>
                  <p className="text-chrome-500 text-sm mb-4">
                    Get notified about new drops and exclusive releases.
                  </p>
                  <form className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 bg-vault-800 border border-vault-700 rounded-lg px-3 py-2 text-sm text-chrome-200 placeholder:text-chrome-600 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                    >
                      Join
                    </button>
                  </form>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-12 pt-8 border-t border-vault-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-chrome-600 text-xs">
                  &copy; {new Date().getFullYear()} Tokyo Spin Vault. All rights
                  reserved.
                </p>
                <p className="text-chrome-700 text-[10px]">
                  Beyblade is a trademark of Takara Tomy. This store is not
                  affiliated with Takara Tomy.
                </p>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterLink({to, children}: {to: string; children: React.ReactNode}) {
  return (
    <li>
      <NavLink
        prefetch="intent"
        to={to}
        className={({isActive}) =>
          clsx(
            'text-sm transition-colors duration-200',
            isActive
              ? 'text-gold-400'
              : 'text-chrome-400 hover:text-chrome-200',
          )
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <ul className="space-y-3">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return (
          <li key={item.id}>
            {isExternal ? (
              <a
                href={url}
                rel="noopener noreferrer"
                target="_blank"
                className="text-sm text-chrome-400 hover:text-chrome-200 transition-colors duration-200"
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                end
                prefetch="intent"
                to={url}
                className={({isActive}) =>
                  clsx(
                    'text-sm transition-colors duration-200',
                    isActive
                      ? 'text-gold-400'
                      : 'text-chrome-400 hover:text-chrome-200',
                  )
                }
              >
                {item.title}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
