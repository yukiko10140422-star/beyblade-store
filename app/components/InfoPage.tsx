import {Breadcrumbs} from '~/components/Breadcrumbs';

/** Plain text page used by About / Shipping / Returns / Condition guide. */
export function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[820px] px-4 pb-14 pt-[18px] md:px-10">
      <Breadcrumbs
        className="mb-5"
        items={[{label: 'Home', href: '/'}, {label: title}]}
      />
      <h1 className="m-0 text-[24px] font-bold text-chrome-200 md:text-[30px]">
        {title}
      </h1>
      {intro && <p className="mb-0 mt-3 text-[16px]">{intro}</p>}
      <div className="mt-8 flex flex-col gap-8 text-[15px] [&_h2]:m-0 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-chrome-200 [&_p]:m-0 [&_p]:mb-2">
        {children}
      </div>
    </div>
  );
}

export function FactTable({
  rows,
}: {
  rows: ReadonlyArray<readonly [string, React.ReactNode]>;
}) {
  return (
    <dl className="m-0 rounded-[4px] border border-vault-700 bg-white">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="grid grid-cols-1 gap-1 border-b border-vault-700 px-4 py-[11px] text-sm last:border-b-0 sm:grid-cols-3 sm:gap-4"
        >
          <dt className="text-chrome-400">{k}</dt>
          <dd className="m-0 text-chrome-200 sm:col-span-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
