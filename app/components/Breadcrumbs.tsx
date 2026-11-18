import {Link} from 'react-router';
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
        'flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden text-[13px] text-chrome-400',
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span
            key={i}
            className={clsx(
              'flex items-center gap-2',
              // Earlier crumbs keep their width (no 1-letter wrapping at
              // 320px); the last one takes what is left and truncates.
              isLast && truncateLast ? 'min-w-0 flex-1' : 'shrink-0',
            )}
          >
            {item.href && !isLast ? (
              <Link
                to={item.href}
                prefetch="intent"
                className="whitespace-nowrap text-chrome-400 underline-offset-2 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={clsx(
                  'text-chrome-400',
                  truncateLast && isLast && 'min-w-0 truncate',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span aria-hidden="true">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
