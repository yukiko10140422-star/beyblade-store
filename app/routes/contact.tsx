import type {Route} from './+types/contact';
import {FactTable, InfoPage} from '~/components/InfoPage';
import {
  COMPANY,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LEGAL_NOTICE_PATH,
  REPRESENTATIVES,
  SITE,
} from '~/lib/site';

/**
 * Contact page. Only facts already shown on About (company, address,
 * corporate number), the contact e-mail and the phone number (published
 * by owner decision 2026-11-26, ops journal #1251). No reply-time promise
 * (none is decided for general enquiries).
 */
export const meta: Route.MetaFunction = () => [
  {title: `Contact us | ${SITE.name}`},
  {
    name: 'description',
    content: `Contact ${SITE.name} by e-mail at ${CONTACT_EMAIL} or by phone at ${CONTACT_PHONE.display}. Operated by ${COMPANY.displayName}, Yokohama, Japan.`,
  },
];

const COMPANY_REPS = REPRESENTATIVES.join(', ');

export default function Contact() {
  return (
    <InfoPage
      title="Contact us"
      intro="For questions about an order or a product, e-mail or call us."
    >
      <section>
        <FactTable
          rows={[
            [
              'Email',
              <a
                key="mail"
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-holo-500 underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>,
            ],
            [
              'Phone',
              <a
                key="tel"
                href={CONTACT_PHONE.href}
                className="text-holo-500 underline-offset-2 hover:underline"
              >
                {CONTACT_PHONE.display}
              </a>,
            ],
            ['Operated by', COMPANY.displayName],
            ['Representative directors', COMPANY_REPS],
            ['Address', COMPANY.postalAddress],
            [
              'Corporate number',
              <a
                key="cn"
                href={COMPANY.corporateNumberUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-holo-500 underline-offset-2 hover:underline"
              >
                {COMPANY.corporateNumber} (National Tax Agency record)
              </a>,
            ],
            [
              'Legal notice',
              <a
                key="legal"
                href={LEGAL_NOTICE_PATH}
                className="text-holo-500 underline-offset-2 hover:underline"
              >
                特定商取引法に基づく表記
              </a>,
            ],
          ]}
        />
      </section>
    </InfoPage>
  );
}
