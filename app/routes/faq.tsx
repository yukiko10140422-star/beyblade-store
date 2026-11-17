import type {Route} from './+types/faq';
import {InfoPage} from '~/components/InfoPage';
import {
  DUTIES,
  DHL_EXPRESS_LABEL,
  EXPRESS_OPTIONS,
  EXPRESS_UPGRADE_LINE,
  NO_EU_LINE,
  PRICE_AT_CHECKOUT,
  RETURNS,
  SHIPPING_METHODS,
  expressFromText,
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
      `From Kanagawa, Japan, with tracking: ${SHIPPING_METHODS.epacket.label} (standard; over 2 kg by EMS) or ${SHIPPING_METHODS.ems.label} (express). Where EMS does not reach, Express goes by ${DHL_EXPRESS_LABEL}.`,
    ],
    ['Do you ship to the EU?', NO_EU_LINE],
    ['Will I pay duties or import taxes on delivery?', `No. ${DUTIES.line}.`],
    [
      'When will my order ship?',
      'Each product page shows when the item ships, when this is set for the item. With Express + priority handling, your order ships within 5 business days.',
    ],
    [
      'How much is Express?',
      `Express is ${SHIPPING_METHODS.ems.label} (${DHL_EXPRESS_LABEL} to the few countries EMS does not serve), ${expressFromText(EXPRESS_OPTIONS[0])}. Express + priority handling costs US$${EXPRESS_OPTIONS[1].extraUsd} more and ships within ${EXPRESS_OPTIONS[1].handling} business days. ${PRICE_AT_CHECKOUT} ${EXPRESS_UPGRADE_LINE}`,
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
