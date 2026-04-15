import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useId} from 'react';
import clsx from 'clsx';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const panelRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // ESC to close + focus management (trap focus + restore on close)
  useEffect(() => {
    if (!expanded) return;

    // Save previously focused element to restore on close
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the panel
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const abortController = new AbortController();
    document.addEventListener(
      'keydown',
      function handler(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          close();
          return;
        }
        if (event.key !== 'Tab') return;

        // Focus trap inside the panel
        const items = panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!items || items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      },
      {signal: abortController.signal},
    );

    return () => {
      abortController.abort();
      // Restore focus on close
      previouslyFocusedRef.current?.focus();
    };
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={clsx(
        'fixed inset-0 z-[100] transition-all duration-300',
        expanded
          ? 'visible opacity-100'
          : 'invisible opacity-0 pointer-events-none',
      )}
      role="dialog"
      aria-labelledby={id}
    >
      {/* Overlay backdrop */}
      <button
        className="absolute inset-0 bg-vault-950/80 backdrop-blur-sm cursor-default"
        onClick={close}
        aria-label="Close"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={clsx(
          'absolute right-0 top-0 h-full w-full max-w-[420px] flex flex-col',
          'bg-gradient-to-b from-vault-800 to-vault-900',
          'border-l border-gold-400/10',
          'shadow-[-20px_0_60px_rgba(0,0,0,0.5)]',
          'transition-transform duration-300 ease-out',
          expanded ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-vault-700">
          <h3
            id={id}
            className="font-heading text-sm uppercase tracking-[0.2em] text-gold-400"
          >
            {heading}
          </h3>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg text-chrome-400 hover:text-gold-400 hover:bg-vault-700 transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-4">{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
