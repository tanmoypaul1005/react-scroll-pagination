import { ReactNode } from 'react';

export interface ScrollPaginationProps {
  children: ReactNode;
  loadMore: (options?: { signal?: AbortSignal | null; isPrefetch?: boolean }) => void | Promise<void>;
  hasMore: boolean;
  loading?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  reverse?: boolean;
  scrollDirection?: 'up' | 'down' | 'both';
  onError?: (error: Error) => void;
  onRetry?: (error: Error, attempt: number, delayMs: number, isPrefetch: boolean) => void;
  retryOnError?: boolean;
  retryAttempts?: number;
  retryDelayMs?: number;
  retryBackoffFactor?: number;
  retryMaxDelayMs?: number;
  className?: string;
  loaderClassName?: string;
  initialLoad?: boolean;
  debounceMs?: number;
  throttleMs?: number;
  pauseWhenHidden?: boolean;
  endMessage?: ReactNode | (() => ReactNode);
  loader?: ReactNode | (() => ReactNode);
  enablePrefetch?: boolean;
  prefetchOffset?: number;
  prefetchStrategy?: 'visibility' | 'idle' | 'visibility-idle';
  adaptivePrefetch?: boolean;
  prefetchMinOffset?: number;
  prefetchMaxOffset?: number;
  prefetchSpeedFactor?: number;
  manualLoadMore?: (options: { onClick: () => void; isLoading: boolean; error: Error | null }) => ReactNode;
  manualLoadMoreLabel?: string;
  manualLoadMoreLoadingLabel?: string;
  manualLoadMoreClassName?: string;
  enableAbort?: boolean;
  abortOnNewLoad?: boolean;
  abortOnUnmount?: boolean;
}

declare const ScrollPagination: React.FC<ScrollPaginationProps>;

export default ScrollPagination;