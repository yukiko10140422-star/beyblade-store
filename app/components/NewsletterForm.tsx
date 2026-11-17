import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import clsx from 'clsx';
import {CheckCircleIcon} from '~/components/icons';

type NewsletterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

interface NewsletterFormProps {
  /**
   * "large" — homepage hero-style form (stacked on mobile, bigger inputs)
   * "compact" — footer-style form (inline, smaller)
   */
  variant?: 'large' | 'compact';
  successFallback?: string;
}

export function NewsletterForm({
  variant = 'large',
  successFallback = 'Welcome to the Vault!',
}: NewsletterFormProps) {
  const fetcher = useFetcher<NewsletterResponse>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success;
  const isLarge = variant === 'large';

  useEffect(() => {
    if (isSuccess && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 rounded-[4px] bg-silver-400/10 border border-silver-400/20',
          isLarge ? 'justify-center py-4 px-6 max-w-md mx-auto' : 'py-2 px-3',
        )}
        role="status"
      >
        <CheckCircleIcon
          className={clsx(isLarge ? 'w-5 h-5' : 'w-4 h-4', 'text-silver-400')}
        />
        <p
          className={clsx(
            'text-silver-400',
            isLarge ? 'text-sm font-heading' : 'text-xs',
          )}
        >
          {fetcher.data?.message || successFallback}
        </p>
      </div>
    );
  }

  return (
    <>
      <fetcher.Form
        method="post"
        action="/api/newsletter"
        className={clsx(
          isLarge
            ? 'flex flex-col sm:flex-row gap-3 max-w-md mx-auto'
            : 'flex gap-2',
        )}
      >
        <input
          ref={inputRef}
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          aria-label="Email address for newsletter"
          className={clsx(
            'flex-1 bg-vault-800 border border-[#8F897D] rounded-[4px] text-chrome-200 placeholder:text-chrome-600 focus:border-holo-500 focus:outline-none focus:ring-2 focus:ring-holo-500/30 transition-all',
            isLarge ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            'bg-silver-500 hover:bg-silver-400 text-white font-heading rounded-[4px] transition-all duration-200 disabled:opacity-50',
            isLarge ? ' text-xs px-6 py-3 hover:' : ' text-xs px-4 py-2',
          )}
        >
          {isSubmitting
            ? isLarge
              ? 'Joining...'
              : '...'
            : isLarge
              ? 'Subscribe'
              : 'Join'}
        </button>
      </fetcher.Form>
      {fetcher.data?.error && (
        <p
          className={clsx('text-danger-500 text-xs', isLarge ? 'mt-3' : 'mt-2')}
          role="alert"
        >
          {fetcher.data.error}
        </p>
      )}
    </>
  );
}
