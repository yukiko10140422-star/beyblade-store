import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {NewsletterForm} from './NewsletterForm';
import {InstagramIcon, TikTokIcon} from '~/components/icons';
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
          <footer className="bg-vault-800 border-t border-vault-700 mt-auto">
            {/* Trust strip — leverages NinJapon's eBay track record */}
            <div className="border-b border-vault-700 bg-white">
              <div className="mx-auto max-w-7xl px-4 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                <div>
                  <div className="font-display text-xl font-semibold text-vault-50">
                    3,800+
                  </div>
                  <div className="text-chrome-400 text-xs uppercase tracking-wider">
                    Verified Shipments via NinJapon
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-vault-50">
                    100%
                  </div>
                  <div className="text-chrome-400 text-xs uppercase tracking-wider">
                    Authentic Takara Tomy
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-vault-50">
                    Free DDP
                  </div>
                  <div className="text-chrome-400 text-xs uppercase tracking-wider">
                    All Duties Included
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-vault-50">
                    Tokyo, JP
                  </div>
                  <div className="text-chrome-400 text-xs uppercase tracking-wider">
                    Ships Direct from Japan
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="md:col-span-1">
                  <img
                    src="/images/logo.webp"
                    srcSet="/images/logo.webp 1x, /images/logo@2x.webp 2x"
                    alt="Tokyo Spin Vault"
                    width={96}
                    height={96}
                    className="h-16 w-auto mb-4"
                    loading="lazy"
                  />
                  <p className="text-chrome-400 text-sm leading-relaxed">
                    Authentic Takara Tomy Beyblades, sourced directly in Tokyo
                    by NinJapon — a trusted Japanese exporter with 3,800+
                    international shipments.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <a
                      href="https://www.instagram.com/tsv_2026"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white border border-vault-700 flex items-center justify-center text-chrome-400 hover:text-vermillion-500 hover:border-vermillion-300 transition-all"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@tokyo.spin.vault"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white border border-vault-700 flex items-center justify-center text-chrome-400 hover:text-vermillion-500 hover:border-vermillion-300 transition-all"
                      aria-label="TikTok"
                    >
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Shop Column */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-chrome-300 mb-4 font-semibold">
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
                  <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-chrome-300 mb-4 font-semibold">
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
              ? 'text-vermillion-500'
              : 'text-chrome-400 hover:text-vault-50',
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
          item.url.includes('myshopify.dev') ||
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
                className="text-sm text-chrome-400 hover:text-vault-50 transition-colors duration-200"
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
      <h3 className="font-heading text-xs uppercase tracking-[0.2em] text-chrome-300 mb-4 font-semibold">
        Vault Access
      </h3>
      <p className="text-chrome-400 text-sm mb-4">
        Get notified about new drops and exclusive releases.
      </p>
      <NewsletterForm variant="compact" />
    </div>
  );
}
