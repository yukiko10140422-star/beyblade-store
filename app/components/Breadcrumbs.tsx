import clsx from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  truncateLast?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  truncateLast = false,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'text-chrome-500 text-sm flex items-center gap-2',
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="hover:text-gold-400 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={clsx(
                  'text-chrome-300',
                  truncateLast && isLast && 'truncate max-w-[200px]',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-vault-600">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
