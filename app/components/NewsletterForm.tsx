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
          'flex items-center gap-2 rounded-lg bg-gold-400/10 border border-gold-400/20',
          isLarge ? 'justify-center py-4 px-6 max-w-md mx-auto' : 'py-2 px-3',
        )}
        role="status"
      >
        <CheckCircleIcon
          className={clsx(isLarge ? 'w-5 h-5' : 'w-4 h-4', 'text-gold-400')}
        />
        <p
          className={clsx(
            'text-gold-400',
            isLarge
              ? 'text-sm font-heading uppercase tracking-wider'
              : 'text-xs',
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
            'flex-1 bg-vault-800 border border-vault-700 rounded-lg text-chrome-200 placeholder:text-chrome-600 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all',
            isLarge ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            'bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading uppercase rounded-lg transition-all duration-200 disabled:opacity-50',
            isLarge
              ? 'tracking-[0.2em] text-xs px-6 py-3 hover:glow-gold-sm'
              : 'tracking-wider text-xs px-4 py-2',
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
