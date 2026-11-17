import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {PaymentMethods} from '~/components/PaymentMethods';
import {CountryPicker} from '~/components/CountryPicker';
import {
  COMPANY,
  EBAY_RECORD,
  SISTER_STORES,
  SITE,
  CONTACT_EMAIL,
} from '~/lib/site';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Four columns (Shop / Help / Company / Sister stores) and a bottom line
 * with the operating company, corporate number, payment methods (from the
 * live Shopify settings) and the trademark note.
 * Links only go to pages that exist in this site's code.
 */
export function Footer({header}: FooterProps) {
  return (
    <footer className="mt-auto border-t border-vault-700 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-4 pb-5 pt-9 text-sm md:grid-cols-4 md:px-10">
        <FooterColumn title="Shop">
          <FooterLink to="/collections/all-beyblades">All products</FooterLink>
          <FooterLink to="/collections/beyblade-x">Beyblade X</FooterLink>
          <FooterLink to="/collections/pre-order">Pre-order</FooterLink>
          <FooterLink to="/collections/launchers-accessories">
            Launchers
          </FooterLink>
        </FooterColumn>
        <FooterColumn title="Help">
          <FooterLink to="/shipping">Shipping</FooterLink>
          <FooterLink to="/returns">Returns</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <li>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-chrome-300 hover:text-holo-500"
            >
              Contact: {CONTACT_EMAIL}
            </a>
          </li>
        </FooterColumn>
        <FooterColumn title="Company">
          <FooterLink to="/about">About us</FooterLink>
          <FooterLink to="/policies/privacy-policy">Privacy policy</FooterLink>
          <li>
            <a
              href={EBAY_RECORD.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-chrome-300 hover:text-holo-500"
            >
              We also sell on eBay as {EBAY_RECORD.sellerName}
            </a>
          </li>
        </FooterColumn>
        <FooterColumn title="Sister stores">
          {SISTER_STORES.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="text-chrome-300 hover:text-holo-500">
                {s.name} — {s.what}
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 border-t border-vault-700 px-4 py-4 text-[12.5px] text-chrome-400 md:flex-row md:items-center md:justify-between md:px-10">
        <span>
          {COMPANY.displayName} · {COMPANY.city} · Corporate number{' '}
          {COMPANY.corporateNumber}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <PaymentMethods settings={header.shop.paymentSettings} />
          <CountryPicker />
        </div>
      </div>
      <p className="mx-auto max-w-[1200px] px-4 pb-7 text-[11.5px] text-chrome-400 md:px-10">
        Product names are trademarks of their owners. {SITE.name} is not
        affiliated with Takara Tomy.
      </p>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-chrome-200">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({to, children}: {to: string; children: React.ReactNode}) {
  return (
    <li>
      <NavLink
        prefetch="intent"
        to={to}
        className="text-chrome-300 hover:text-holo-500"
      >
        {children}
      </NavLink>
    </li>
  );
}
