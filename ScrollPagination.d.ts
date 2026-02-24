import { ReactNode } from 'react';

export interface ScrollPaginationProps {
  children: ReactNode;
  loadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  reverse?: boolean;
  scrollDirection?: 'up' | 'down' | 'both';
  onError?: (error: Error) => void;
  retryOnError?: boolean;
  className?: string;
  loaderClassName?: string;
  initialLoad?: boolean;
  debounceMs?: number;
  endMessage?: ReactNode | (() => ReactNode);
  loader?: ReactNode | (() => ReactNode);
  enablePrefetch?: boolean;
  prefetchOffset?: number;
}

declare const ScrollPagination: React.FC<ScrollPaginationProps>;

export default ScrollPagination;