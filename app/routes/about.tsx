import type {Route} from './+types/about';
import {FactTable, InfoPage} from '~/components/InfoPage';
import {COMPANY, EBAY_RECORD, SISTER_STORES, SITE} from '~/lib/site';
import {SITE_URL} from '~/lib/constants';
import {organizationJsonLd} from '~/lib/structured-data';

export const meta: Route.MetaFunction = () => [
  {'script:ld+json': organizationJsonLd(SITE_URL, `${SITE_URL}/images/logo.png`)},
  {title: `About us | ${SITE.name}`},
  {
    name: 'description',
    content: `${SITE.name} is run by ${COMPANY.displayName}, Yokohama, Japan. Corporate number ${COMPANY.corporateNumber}.`,
  },
];

export default function About() {
  const e = EBAY_RECORD;
  return (
    <InfoPage
      title="About us"
      intro={`${SITE.name} sells Japanese Beyblade X products and ships them from Japan.`}
    >
      <section>
        <h2>What we sell</h2>
        <p>
          Japanese versions of Takara Tomy Beyblade X releases. Every product
          page shows the model number and when the item ships. Pre-orders show
          the release date.
        </p>
      </section>

      <section>
        <h2>Company</h2>
        <FactTable
          rows={[
            ['Operated by', COMPANY.displayName],
            ['Address', COMPANY.address],
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

      <section>
        <h2>On eBay</h2>
        <p>
          We also sell on eBay as {e.sellerName}. As of {e.asOf}: feedback score{' '}
          {e.feedbackScore}, {e.positive} positive ({e.positivePeriod}),{' '}
          {e.itemsSold} items sold.
        </p>
        <a
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-holo-500 hover:underline"
        >
          See our eBay feedback
        </a>
      </section>

      <section>
        <h2>Sister stores</h2>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {SISTER_STORES.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="text-holo-500 hover:underline">
                {s.name}
              </a>{' '}
              — {s.what}
            </li>
          ))}
        </ul>
      </section>
    </InfoPage>
  );
}
