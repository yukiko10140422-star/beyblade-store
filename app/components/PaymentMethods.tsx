import clsx from 'clsx';

const WALLET_LABEL: Record<string, string> = {
  SHOPIFY_PAY: 'Shop Pay',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  ANDROID_PAY: 'Google Pay',
  PAYPAL: 'PayPal',
  AMAZON_PAY: 'Amazon Pay',
};

const CARD_LABEL: Record<string, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMERICAN_EXPRESS: 'American Express',
  DISCOVER: 'Discover',
  JCB: 'JCB',
  DINERS_CLUB: 'Diners Club',
};

export interface PaymentSettingsLike {
  acceptedCardBrands?: readonly string[] | null;
  supportedDigitalWallets?: readonly string[] | null;
}

/**
 * Payment methods as plain text chips, read from the store's live Shopify
 * payment settings (never typed by hand). Brand logos are not used.
 */
export function PaymentMethods({
  settings,
  className,
}: {
  settings: PaymentSettingsLike | null | undefined;
  className?: string;
}) {
  const wallets = (settings?.supportedDigitalWallets ?? [])
    .map((w) => WALLET_LABEL[w])
    .filter((x): x is string => Boolean(x));
  const cards = (settings?.acceptedCardBrands ?? [])
    .map((c) => CARD_LABEL[c])
    .filter((x): x is string => Boolean(x));
  const labels = [...new Set([...wallets, ...cards])];
  if (labels.length === 0) return null;
  return (
    <ul
      className={clsx('flex flex-wrap gap-1.5', className)}
      aria-label="Payment methods"
    >
      {labels.map((l) => (
        <li
          key={l}
          className="rounded-[3px] border border-vault-600 bg-white px-2 py-0.5 text-xs text-chrome-400"
        >
          {l}
        </li>
      ))}
    </ul>
  );
}
