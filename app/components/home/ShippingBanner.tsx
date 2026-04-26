import {
  ShieldCheckIcon,
  PaperAirplaneIcon,
  ClockIcon,
} from '~/components/icons';

export function ShippingBanner() {
  const items = [
    {
      icon: <PaperAirplaneIcon className="w-5 h-5" />,
      text: 'Free Shipping from Tokyo (ePacket Light)',
    },
    {
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      text: 'DDP — Duties & Taxes Included',
    },
    {
      icon: <ClockIcon className="w-5 h-5" />,
      text: 'DHL/FedEx Free on $300+ or 3+ Items',
    },
  ];

  return (
    <section className="py-6 bg-vault-50 text-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && (
              <div className="hidden md:block w-px h-5 bg-chrome-500 -ml-6 mr-3" />
            )}
            <span className="text-vermillion-300">{item.icon}</span>
            <span className="text-white text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
