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
  /** ebay.condition — the condition of the eBay listing it was imported from. */
  ebayCondition?: MetaValue;
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
    row('Condition', conditionField(p)),
  ];
  return rows.filter((r): r is DetailRow => r !== null);
}

/** beyblade.condition, else the eBay listing's condition (ebay.condition). */
function conditionField(p: BeyMetafields): MetaValue {
  return metaValue(p.condition) ? p.condition : p.ebayCondition;
}

function row(label: string, m: MetaValue, mono = false): DetailRow | null {
  const v = metaValue(m);
  return v ? {label, value: v, mono} : null;
}

/**
 * schema.org itemCondition / og product:condition — only when the product
 * states it (beyblade.condition, else ebay.condition; shown in Details).
 * Nothing is assumed otherwise.
 */
export function getItemCondition(
  p: BeyMetafields,
): {schema: string; og: 'new' | 'used'} | null {
  const c = (metaValue(conditionField(p)) ?? '').toLowerCase();
  if (!c) return null;
  // Word boundary before "opened": "Unopened" must not read as used.
  if (/used|pre-?owned|\bopened/.test(c)) {
    return {schema: 'https://schema.org/UsedCondition', og: 'used'};
  }
  if (/new|sealed|unopened/.test(c)) {
    return {schema: 'https://schema.org/NewCondition', og: 'new'};
  }
  return null;
}
