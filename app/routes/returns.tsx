import type {Route} from './+types/returns';
import {InfoPage} from '~/components/InfoPage';
import {RETURNS} from '~/lib/shipping';
import {SITE} from '~/lib/site';

export const meta: Route.MetaFunction = () => [
  {title: `Returns | ${SITE.name}`},
  {name: 'description', content: RETURNS.summary},
];

/**
 * Summary of the store's published refund policy (shared Shopify store,
 * read 2026-11-17). How to request a return is not shown until a contact
 * address for this store is decided.
 */
export default function Returns() {
  return (
    <InfoPage title="Returns">
      <section>
        <h2>Conditions</h2>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
          <li>
            Returns are accepted within {RETURNS.windowDays} days of delivery.
          </li>
          <li>Items must be in their original, unopened, sealed condition.</li>
          <li>Return shipping is paid by the buyer.</li>
          <li>
            Items opened, used or damaged by the buyer cannot be returned.
          </li>
        </ul>
      </section>
      <section>
        <h2>Damaged on arrival</h2>
        <p>
          If an item arrives damaged or defective, contact us within 48 hours of
          delivery with photos of the damage.
        </p>
      </section>
      <section>
        <h2>Refunds</h2>
        <p>
          Refunds are issued to the original payment method after the returned
          item is received and inspected.
        </p>
      </section>
    </InfoPage>
  );
}
