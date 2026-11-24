import type {Route} from './+types/contact';
import {FactTable, InfoPage} from '~/components/InfoPage';
import {COMPANY, CONTACT_EMAIL, SITE} from '~/lib/site';

/**
 * Contact page. Only facts already shown on About (company, address,
 * corporate number) and the contact e-mail. No phone number (not public)
 * and no reply-time promise (none is decided for general enquiries).
 */
export const meta: Route.MetaFunction = () => [
  {title: `Contact us | ${SITE.name}`},
  {
    name: 'description',
    content: `Contact ${SITE.name} by e-mail at ${CONTACT_EMAIL}. Operated by ${COMPANY.displayName}, Yokohama, Japan.`,
  },
];

export default function Contact() {
  return (
    <InfoPage
      title="Contact us"
      intro="For questions about an order or a product, e-mail us."
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
            ['Operated by', COMPANY.displayName],
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
          ]}
        />
      </section>
    </InfoPage>
  );
}
