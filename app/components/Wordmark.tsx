import clsx from 'clsx';
import {SITE} from '~/lib/site';

/**
 * Text logo: small "TOKYO" over "Spin Vault", with "Vault" in the store
 * colour. Same structure in all three Vault stores; only the word and the
 * colour change. No drawn mark.
 */
export function Wordmark({className}: {className?: string}) {
  const [, first] = SITE.shortName.match(/^(\S+)\s+Vault$/) ?? [];
  return (
    <span
      className={clsx('flex flex-col leading-[1.1] text-chrome-200', className)}
      aria-label={SITE.name}
    >
      <span
        aria-hidden="true"
        className="text-[9px] font-semibold tracking-[0.08em] text-chrome-400 md:text-[11px]"
      >
        TOKYO
      </span>
      <span aria-hidden="true" className="text-[17px] font-bold md:text-[21px]">
        {first ?? SITE.shortName} <span className="text-holo-500">Vault</span>
      </span>
    </span>
  );
}
