import type {Route} from './+types/faq';
import {InfoPage} from '~/components/InfoPage';
import {
  DUTIES,
  EXPRESS_OPTIONS,
  EXPRESS_UPGRADE,
  RETURNS,
  SHIPPING_METHODS,
} from '~/lib/shipping';
import {COMPANY, CONTACT_EMAIL, SITE} from '~/lib/site';

export const meta: Route.MetaFunction = () => [
  {title: `FAQ | ${SITE.name}`},
  {
    name: 'description',
    content: `Shipping, duties, returns and contact for ${SITE.name}.`,
  },
];

/** Every answer is built from shipping.ts / site.ts (sourced facts only). */
export default function Faq() {
  const items: Array<[string, React.ReactNode]> = [
    [
      'Where do orders ship from?',
      `From Kanagawa, Japan, by Japan Post with tracking: ${SHIPPING_METHODS.epacket.label} (standard) or ${SHIPPING_METHODS.ems.label} (express).`,
    ],
    ['Will I pay duties or import taxes on delivery?', `No. ${DUTIES.line}.`],
    [
      'When will my order ship?',
      'Each product page shows when the item ships, when this is set for the item. With Express + priority handling, your order ships within 5 business days.',
    ],
    [
      'How fast is Express?',
      `${EXPRESS_OPTIONS.map((o) => `${o.label}: ${o.surcharge}`).join('; ')}. Free Express upgrade on orders of US$${EXPRESS_UPGRADE.subtotalThreshold}+ or ${EXPRESS_UPGRADE.quantityThreshold}+ items (up to US$${EXPRESS_UPGRADE.maxShippingValue} shipping value).`,
    ],
    ['Can I return an item?', RETURNS.summary],
    [
      'How do I contact you?',
      <a
        key="mail"
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-holo-500 hover:underline"
      >
        {CONTACT_EMAIL}
      </a>,
    ],
  ];
  return (
    <InfoPage title="FAQ">
      <dl className="m-0 flex flex-col gap-6">
        {items.map(([q, a]) => (
          <div key={q}>
            <dt className="font-semibold text-chrome-200">{q}</dt>
            <dd className="m-0 mt-1">{a}</dd>
          </div>
        ))}
      </dl>
    </InfoPage>
  );
}
