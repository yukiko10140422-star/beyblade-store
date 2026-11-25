import type {Route} from './+types/shipping';
import {FactTable, InfoPage} from '~/components/InfoPage';
import {
  DUTIES,
  DHL_EXPRESS_LABEL,
  EXPRESS_OPTIONS,
  EXPRESS_PROMO_LIVE,
  EXPRESS_REGIONS,
  EXPRESS_UPGRADE_LINE,
  JAPAN_POST_DAYS,
  WHERE_WE_SHIP_LINE,
  PRICE_AT_CHECKOUT,
  SHIPPING_METHODS,
  expressCarrierLabel,
  expressFromText,
} from '~/lib/shipping';
import {CONTACT_EMAIL, SITE} from '~/lib/site';

export const meta: Route.MetaFunction = () => [
  {title: `Shipping | ${SITE.name}`},
  {
    name: 'description',
    content:
      'Orders ship from Japan with tracking, by Japan Post ePacket or EMS (DHL Express to a few countries). Duties included — no extra charges on delivery.',
  },
];

const SOURCE_EMS =
  'https://www.post.japanpost.jp/send/oversea/date/ems/minamikanto.html';
const SOURCE_AIR =
  'https://www.post.japanpost.jp/send/oversea/date/normal/minamikanto.html';

export default function Shipping() {
  const rows = Object.entries(JAPAN_POST_DAYS);
  return (
    <InfoPage
      title="Shipping"
      intro="Orders ship from Kanagawa, Japan, with tracking — by Japan Post, or by DHL Express where Japan Post EMS does not reach."
    >
      <section>
        <h2>Methods</h2>
        <FactTable
          rows={[
            [
              'Standard',
              `${SHIPPING_METHODS.epacket.label}; parcels over 2 kg go by ${SHIPPING_METHODS.ems.label}.`,
            ],
            [
              'Express',
              `${SHIPPING_METHODS.ems.label}; ${DHL_EXPRESS_LABEL} to the few countries Japan Post EMS does not serve (listed below).`,
            ],
            ['Cost', PRICE_AT_CHECKOUT],
            ['Where we ship', WHERE_WE_SHIP_LINE],
            ['Duties', DUTIES.line],
          ]}
        />
      </section>

      <section>
        <h2>Express options</h2>
        <FactTable
          rows={EXPRESS_OPTIONS.map(
            (o) =>
              [
                o.label,
                `${expressFromText(o)}${o.extraUsd ? ` (the Express price + US$${o.extraUsd})` : ''}. ${
                  o.handling === 'item'
                    ? 'Ships within the dispatch time shown on the product page.'
                    : `Your order ships within ${o.handling} business days.`
                }`,
              ] as const,
          )}
        />
        <p className="mt-3">
          Express starts at these prices for the lightest parcels.{' '}
          {PRICE_AT_CHECKOUT}
        </p>
        <FactTable
          rows={EXPRESS_REGIONS.map(
            (r) =>
              [
                r.region,
                `from US$${r.fromUsd} · ${expressCarrierLabel(r.carrier)}`,
              ] as const,
          )}
        />
        {EXPRESS_PROMO_LIVE && (
          <p className="mt-3">{EXPRESS_UPGRADE_LINE} Applied at checkout.</p>
        )}
      </section>

      <section>
        <h2>Duties and taxes</h2>
        <p>
          {DUTIES.line}. Import duties for your order are paid by us, so the
          carrier does not collect them from you on delivery.
        </p>
      </section>

      <section>
        <h2>When your order ships</h2>
        <p>
          Product pages show when the item ships if this is set for the item
          (for example, “Ships within 3 business days”). Business days are
          Monday to Friday, Japan time.
        </p>
      </section>

      <section>
        <h2>Delivery time after dispatch</h2>
        <p>
          Japan Post’s standard delivery days from our area (Minami-Kanto).
          These are Japan Post’s estimates, not guarantees. A dash means Japan
          Post does not publish a single number for that destination.
        </p>
        <div className="overflow-x-auto rounded-[4px] border border-vault-700 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-vault-700 text-left">
                <th className="px-4 py-2 font-semibold text-chrome-200">
                  Destination
                </th>
                <th className="px-4 py-2 font-semibold text-chrome-200">
                  ePacket (days)
                </th>
                <th className="px-4 py-2 font-semibold text-chrome-200">
                  EMS (days)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([code, r]) => (
                <tr
                  key={code}
                  className="border-b border-vault-700 last:border-b-0"
                >
                  <td className="px-4 py-2">
                    {r.name
                      .replace(/^the /, '')
                      .replace(/^./, (c) => c.toUpperCase())}
                  </td>
                  <td className="px-4 py-2">{r.air ?? '–'}</td>
                  <td className="px-4 py-2">{r.ems ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[13px] text-chrome-400">
          Source: Japan Post delivery-day tables (
          <a href={SOURCE_AIR} className="text-holo-500 hover:underline">
            airmail
          </a>
          ,{' '}
          <a href={SOURCE_EMS} className="text-holo-500 hover:underline">
            EMS
          </a>
          ), read Nov 17, 2026. ePacket travels as airmail.
        </p>
      </section>

      <section>
        <h2>Tracking</h2>
        <p>
          Both methods are tracked. You receive a shipping confirmation e-mail
          with the tracking number when your order ships. Questions:{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-holo-500 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </InfoPage>
  );
}
