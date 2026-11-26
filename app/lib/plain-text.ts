/**
 * 商品説明の HTML を、JSON-LD などで使う 1 行の文にする (2026-11-26)。
 *
 * Storefront の `product.description` は Shopify がタグを消しただけの文で、
 * 段落・箇条書き・表の切れ目に空白が入らない (例 "Japanese release.Condition: New")。
 * ここではブロックの切れ目と <br> を空白にしてからタグを消す。
 */
const BLOCK_TAG =
  /<\/?(?:p|div|li|ul|ol|h[1-6]|tr|td|th|table|thead|tbody|blockquote|section|article|dt|dd|dl|figure|figcaption|hr)\b[^>]*>|<br\s*\/?>/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntity(match: string, body: string): string {
  if (body[0] === '#') {
    const code =
      body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff
      ? String.fromCodePoint(code)
      : match;
  }
  return NAMED_ENTITIES[body.toLowerCase()] ?? match;
}

export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(BLOCK_TAG, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, ' ')
    .trim();
}
