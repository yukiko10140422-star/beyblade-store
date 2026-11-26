import type {Route} from './+types/returns';
import {InfoPage} from '~/components/InfoPage';
import {RETURNS} from '~/lib/shipping';
import {CONTACT_EMAIL, CONTACT_PHONE, SITE} from '~/lib/site';

export const meta: Route.MetaFunction = () => [
  {title: `Returns | ${SITE.name}`},
  {name: 'description', content: RETURNS.summary},
];

/**
 * The store's refund policy (shared Shopify store). Same content as the
 * Shopify refund policy (/policies/refund-policy) and RETURNS in
 * ~/lib/shipping (owner decision 2026-11-26) — change them together.
 */
export default function Returns() {
  const mail = (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-holo-500 hover:underline"
    >
      {CONTACT_EMAIL}
    </a>
  );
  return (
    <InfoPage title="Returns">
      <section>
        <h2>Conditions</h2>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
          <li>
            Returns are accepted within {RETURNS.windowDays} days of delivery.
          </li>
          <li>
            Items sold as New can be returned if they are unused and in the
            condition they arrived in. This includes items sold without a box.
          </li>
          <li>
            Items sold in any other condition (for example Used or Pre-owned,
            as shown on the product page) cannot be returned.
          </li>
          <li>
            Items used or damaged by the buyer, or not in the condition they
            arrived in, cannot be returned.
          </li>
          <li>Return shipping is paid by the buyer.</li>
        </ul>
      </section>
      <section>
        <h2>How to request a return</h2>
        <p>
          E-mail {mail} with your order number and the reason for the return.
          We reply with the return address. Ship the item back with a tracked
          method. Once we receive and inspect the item, your refund is
          processed within 5–7 business days.
        </p>
      </section>
      <section>
        <h2>Refunds</h2>
        <p>
          Refunds are issued to the original payment method. Please allow 5–10
          business days for the refund to appear on your statement, depending
          on your financial institution.
        </p>
      </section>
      <section>
        <h2>Damaged or defective on arrival</h2>
        <p>
          If an item arrives damaged or defective, e-mail {mail} within 48
          hours of delivery with photos of the damage. We will arrange a
          replacement or a full refund, including shipping costs.
        </p>
      </section>
      <section>
        <h2>Cancellations</h2>
        <p>
          Orders can be cancelled within 12 hours of placement, if the order
          has not shipped yet. E-mail {mail} as soon as possible.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          E-mail {mail} or call{' '}
          <a href={CONTACT_PHONE.href} className="text-holo-500 hover:underline">
            {CONTACT_PHONE.display}
          </a>
          . The full policy:{' '}
          <a href={RETURNS.policyPath} className="text-holo-500 hover:underline">
            Refund policy
          </a>
          .
        </p>
      </section>
    </InfoPage>
  );
}
