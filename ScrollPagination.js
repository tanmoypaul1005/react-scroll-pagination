// ScrollPagination.js
import React, { useEffect, useRef, useCallback, useState } from "react";

const ScrollPagination = ({
  children,
  loadMore,
  hasMore,
  loading = "Loading more...",
  threshold = 0.1,
  rootMargin = "10px",
  reverse = false,
  scrollDirection = "down",
  onError = null,
  retryOnError = false,
  className = "",
  loaderClassName = "",
  initialLoad = false,
  debounceMs = 0,
  endMessage = null,
  loader = null,
  enablePrefetch = false,
  prefetchOffset = 500,
}) => {
  const loaderRef = useRef(null);
  const prefetchTriggerRef = useRef(null);
  const debounceTimer = useRef(null);
  const prefetchDebounceTimer = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const lastScrollY = useRef(0);
  const hasPrefetched = useRef(false);

  const handleLoadMore = useCallback(async (isPrefetch = false) => {
    if (isLoading || isPrefetching) return;
    
    if (isPrefetch) {
      setIsPrefetching(true);
      hasPrefetched.current = true;
    } else {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      await loadMore();
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      if (isPrefetch) {
        setIsPrefetching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [loadMore, isLoading, isPrefetching, onError]);

  const handleRetry = useCallback(() => {
    setError(null);
    hasPrefetched.current = false;
    handleLoadMore();
  }, [handleLoadMore]);

  const checkScrollDirection = useCallback(() => {
    if (typeof window === 'undefined') return true;
    
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY.current;
    lastScrollY.current = currentScrollY;

    if (scrollDirection === "down" && !isScrollingDown) return false;
    if (scrollDirection === "up" && isScrollingDown) return false;
    
    return true;
  }, [scrollDirection]);

  // Prefetch intersection handler - triggers before the main loader
  const handlePrefetchIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading && !isPrefetching && !hasPrefetched.current) {
      if (!checkScrollDirection()) return;

      if (debounceMs > 0) {
        if (prefetchDebounceTimer.current) {
          clearTimeout(prefetchDebounceTimer.current);
        }
        prefetchDebounceTimer.current = setTimeout(() => {
          handleLoadMore(true);
        }, debounceMs);
      } else {
        handleLoadMore(true);
      }
    }
  }, [hasMore, isLoading, isPrefetching, checkScrollDirection, debounceMs, handleLoadMore]);

  const handleIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading && !isPrefetching) {
      if (!checkScrollDirection()) return;

      // Reset prefetch flag when actual loader is reached
      hasPrefetched.current = false;

      if (debounceMs > 0) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          handleLoadMore(false);
        }, debounceMs);
      } else {
        handleLoadMore(false);
      }
    }
  }, [hasMore, isLoading, isPrefetching, checkScrollDirection, debounceMs, handleLoadMore]);

  useEffect(() => {
    // Check if we're in the browser (important for Next.js SSR)
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    const currentLoaderRef = loaderRef.current;

    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  // Prefetch observer - triggers earlier to prefetch next page
  useEffect(() => {
    if (typeof window === 'undefined' || !enablePrefetch) return;

    // Calculate rootMargin for prefetch based on scroll direction and reverse mode
    let prefetchRootMargin;
    if (reverse) {
      // For reverse mode (content loads at top)
      prefetchRootMargin = scrollDirection === 'up' || scrollDirection === 'both'
        ? `0px 0px ${prefetchOffset}px 0px`
        : `${prefetchOffset}px 0px 0px 0px`;
    } else {
      // For normal mode (content loads at bottom)
      prefetchRootMargin = scrollDirection === 'down' || scrollDirection === 'both'
        ? `0px 0px ${prefetchOffset}px 0px`
        : `${prefetchOffset}px 0px 0px 0px`;
    }

    const prefetchObserver = new IntersectionObserver(handlePrefetchIntersection, {
      rootMargin: prefetchRootMargin,
      threshold: 0,
    });

    const currentPrefetchTriggerRef = prefetchTriggerRef.current;

    if (currentPrefetchTriggerRef) {
      prefetchObserver.observe(currentPrefetchTriggerRef);
    }

    return () => {
      if (currentPrefetchTriggerRef) {
        prefetchObserver.unobserve(currentPrefetchTriggerRef);
      }
      if (prefetchDebounceTimer.current) {
        clearTimeout(prefetchDebounceTimer.current);
      }
    };
  }, [handlePrefetchIntersection, enablePrefetch, prefetchOffset, reverse, scrollDirection]);

  // Initial load on mount if enabled
  useEffect(() => {
    if (initialLoad && hasMore && typeof window !== 'undefined') {
      handleLoadMore();
    }
  }, [initialLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset prefetch flag when hasMore changes (new data loaded)
  useEffect(() => {
    hasPrefetched.current = false;
  }, [hasMore]);

  const renderLoader = () => {
    if (error && retryOnError) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'red' }}>Error: {error.message}</p>
          <button 
            onClick={handleRetry}
            style={{
              padding: '8px 16px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    if (loader) {
      return typeof loader === 'function' ? loader() : loader;
    }

    return loading;
  };

  const renderEndMessage = () => {
    if (!endMessage) return null;
    return (
      <div 
        style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}
      >
        {typeof endMessage === 'function' ? endMessage() : endMessage}
      </div>
    );
  };

  const content = reverse ? (
    <>
      {hasMore && (
        <>
          <div 
            ref={loaderRef}
            className={loaderClassName}
            style={{ 
              padding: '20px', 
              textAlign: 'center',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {renderLoader()}
          </div>
          {enablePrefetch && (
            <div 
              ref={prefetchTriggerRef}
              style={{ 
                height: '1px',
                visibility: 'hidden',
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />
          )}
        </>
      )}
      {!hasMore && renderEndMessage()}
      {children}
    </>
  ) : (
    <>
      {children}
      {hasMore && (
        <>
          {enablePrefetch && (
            <div 
              ref={prefetchTriggerRef}
              style={{ 
                height: '1px',
                visibility: 'hidden',
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />
          )}
          <div 
            ref={loaderRef}
            className={loaderClassName}
            style={{ 
              padding: '20px', 
              textAlign: 'center',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {renderLoader()}
          </div>
        </>
      )}
      {!hasMore && renderEndMessage()}
    </>
  );

  return (
    <div className={className}>
      {content}
    </div>
  );
};

export default ScrollPagination;
