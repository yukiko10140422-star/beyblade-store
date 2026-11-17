/**
 * Beyblade attributes read from `beyblade.*` product metafields
 * (existing Spin Vault definitions). Empty values are never guessed.
 */

type MetaValue = {value: string} | null | undefined;

export interface BeyMetafields {
  beybladeType?: MetaValue;
  bladeName?: MetaValue;
  ratchetSpec?: MetaValue;
  bitSpec?: MetaValue;
  series?: MetaValue;
  modelNumber?: MetaValue;
  condition?: MetaValue;
  isLimitedEdition?: MetaValue;
  generation?: MetaValue;
}

export function metaValue(m: MetaValue): string | undefined {
  const v = m?.value?.trim();
  return v ? v : undefined;
}

export interface DetailRow {
  label: string;
  value: string;
  mono?: boolean;
}

export function getBeyDetailRows(p: BeyMetafields): DetailRow[] {
  const rows: Array<DetailRow | null> = [
    row('Model number', p.modelNumber, true),
    row('Series', p.series),
    row('Generation', p.generation),
    row('Type', p.beybladeType),
    row('Blade', p.bladeName),
    row('Ratchet', p.ratchetSpec, true),
    row('Bit', p.bitSpec, true),
    row('Condition', p.condition),
  ];
  return rows.filter((r): r is DetailRow => r !== null);
}

function row(label: string, m: MetaValue, mono = false): DetailRow | null {
  const v = metaValue(m);
  return v ? {label, value: v, mono} : null;
}

/**
 * schema.org itemCondition / og product:condition — only when the product
 * states it (beyblade.condition). Nothing is assumed otherwise.
 */
export function getItemCondition(
  p: BeyMetafields,
): {schema: string; og: 'new' | 'used'} | null {
  const c = (metaValue(p.condition) ?? '').toLowerCase();
  if (!c) return null;
  if (/used|pre-?owned|opened/.test(c)) {
    return {schema: 'https://schema.org/UsedCondition', og: 'used'};
  }
  if (/new|sealed|unopened/.test(c)) {
    return {schema: 'https://schema.org/NewCondition', og: 'new'};
  }
  return null;
}
