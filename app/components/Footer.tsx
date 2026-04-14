import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {NewsletterForm} from './NewsletterForm';
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
                  <div className="flex gap-3 mt-5">
                    <a
                      href="https://www.instagram.com/tsv_2026"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-vault-800 border border-vault-700 flex items-center justify-center text-chrome-400 hover:text-gold-400 hover:border-gold-400/30 transition-all"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.tiktok.com/@tokyo.spin.vault"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-vault-800 border border-vault-700 flex items-center justify-center text-chrome-400 hover:text-gold-400 hover:border-gold-400/30 transition-all"
                      aria-label="TikTok"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.05l-.38.85z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Shop Column */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
                    Shop
                  </h3>
                  <ul className="space-y-3">
                    <FooterLink to="/collections/all-beyblades">
                      All Beyblades
                    </FooterLink>
                    <FooterLink to="/collections/limited-edition-rare">
                      Limited & Rare
                    </FooterLink>
                    <FooterLink to="/collections/beyblade-sets-bundles">
                      Sets & Bundles
                    </FooterLink>
                    <FooterLink to="/collections/launchers-accessories">
                      Launchers
                    </FooterLink>
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
                <FooterNewsletter />
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

function FooterNewsletter() {
  return (
    <div>
      <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
        Vault Access
      </h3>
      <p className="text-chrome-500 text-sm mb-4">
        Get notified about new drops and exclusive releases.
      </p>
      <NewsletterForm variant="compact" />
    </div>
  );
}
