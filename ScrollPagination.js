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
  onRetry = null,
  retryOnError = false,
  retryAttempts = 0,
  retryDelayMs = 500,
  retryBackoffFactor = 2,
  retryMaxDelayMs = 8000,
  className = "",
  loaderClassName = "",
  initialLoad = false,
  debounceMs = 0,
  throttleMs = 0,
  pauseWhenHidden = true,
  endMessage = null,
  loader = null,
  enablePrefetch = false,
  prefetchOffset = 500,
  prefetchStrategy = "visibility",
  adaptivePrefetch = false,
  prefetchMinOffset = 200,
  prefetchMaxOffset = 2000,
  prefetchSpeedFactor = 500,
  manualLoadMore = null,
  manualLoadMoreLabel = "Load more",
  manualLoadMoreLoadingLabel = "Loading...",
  manualLoadMoreClassName = "",
  enableAbort = false,
  abortOnNewLoad = true,
  abortOnUnmount = true,
}) => {
  const loaderRef = useRef(null);
  const prefetchTriggerRef = useRef(null);
  const debounceTimer = useRef(null);
  const prefetchDebounceTimer = useRef(null);
  const throttleTimer = useRef(null);
  const prefetchThrottleTimer = useRef(null);
  const lastLoadTime = useRef(0);
  const lastPrefetchTime = useRef(0);
  const abortControllerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchOffsetState, setPrefetchOffsetState] = useState(prefetchOffset);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const hasPrefetched = useRef(false);
  const prefetchOffsetRef = useRef(prefetchOffset);
  const supportsIntersectionObserver = typeof window === "undefined"
    ? true
    : "IntersectionObserver" in window;

  const shouldPauseForVisibility = useCallback(() => {
    if (!pauseWhenHidden || typeof document === "undefined") return false;
    return document.hidden;
  }, [pauseWhenHidden]);

  const waitUntilVisible = useCallback(() => {
    if (!pauseWhenHidden || typeof document === "undefined") {
      return Promise.resolve();
    }
    if (!document.hidden) return Promise.resolve();

    return new Promise((resolve) => {
      const handleVisibility = () => {
        if (!document.hidden) {
          document.removeEventListener("visibilitychange", handleVisibility);
          resolve();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
    });
  }, [pauseWhenHidden]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const abortActiveRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const getAbortSignal = useCallback(() => {
    if (!enableAbort || typeof AbortController === "undefined") return null;
    if (abortOnNewLoad && abortControllerRef.current) {
      abortActiveRequest();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, [enableAbort, abortOnNewLoad, abortActiveRequest]);

  const handleLoadMore = useCallback(async (isPrefetch = false) => {
    if (isLoading || isPrefetching) return;
    if (shouldPauseForVisibility()) return;

    if (isPrefetch) {
      setIsPrefetching(true);
      hasPrefetched.current = true;
    } else {
      setIsLoading(true);
    }

    setError(null);

    const abortSignal = getAbortSignal();
    let wasAborted = false;

    let lastError = null;
    let attempt = 0;

    while (attempt <= retryAttempts) {
      try {
        await loadMore({ signal: abortSignal, isPrefetch });
        lastError = null;
        break;
      } catch (err) {
        if (enableAbort && err && err.name === "AbortError") {
          wasAborted = true;
          lastError = null;
          break;
        }
        lastError = err;
        if (attempt >= retryAttempts) break;

        const delay = Math.min(
          retryDelayMs * Math.pow(retryBackoffFactor, attempt),
          retryMaxDelayMs
        );

        if (onRetry) {
          onRetry(err, attempt + 1, delay, isPrefetch);
        }

        await waitUntilVisible();
        await sleep(delay);
      }

      attempt += 1;
    }

    if (lastError) {
      setError(lastError);
      if (onError) {
        onError(lastError);
      }
    }

    if (isPrefetch) {
      setIsPrefetching(false);
    } else {
      setIsLoading(false);
    }

    if (enableAbort && !wasAborted) {
      abortControllerRef.current = null;
    }
  }, [
    loadMore,
    isLoading,
    isPrefetching,
    onError,
    onRetry,
    retryAttempts,
    retryDelayMs,
    retryBackoffFactor,
    retryMaxDelayMs,
    shouldPauseForVisibility,
    waitUntilVisible,
    enableAbort,
    getAbortSignal,
  ]);

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
  const scheduleLoad = useCallback((isPrefetch) => {
    const isDebounced = debounceMs > 0;
    const isThrottled = throttleMs > 0 && !isDebounced;
    const timerRef = isPrefetch ? prefetchDebounceTimer : debounceTimer;
    const throttleRef = isPrefetch ? prefetchThrottleTimer : throttleTimer;
    const lastTimeRef = isPrefetch ? lastPrefetchTime : lastLoadTime;

    const invoke = () => handleLoadMore(isPrefetch);

    if (isDebounced) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(invoke, debounceMs);
      return;
    }

    if (isThrottled) {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= throttleMs) {
        lastTimeRef.current = now;
        invoke();
        return;
      }
      if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          throttleRef.current = null;
          lastTimeRef.current = Date.now();
          invoke();
        }, throttleMs - elapsed);
      }
      return;
    }

    invoke();
  }, [debounceMs, throttleMs, handleLoadMore]);

  const handlePrefetchIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading && !isPrefetching && !hasPrefetched.current) {
      if (shouldPauseForVisibility()) return;
      if (!checkScrollDirection()) return;
      scheduleLoad(true);
    }
  }, [
    hasMore,
    isLoading,
    isPrefetching,
    checkScrollDirection,
    scheduleLoad,
    shouldPauseForVisibility,
  ]);

  const handleIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading && !isPrefetching) {
      if (shouldPauseForVisibility()) return;
      if (!checkScrollDirection()) return;

      // Reset prefetch flag when actual loader is reached
      hasPrefetched.current = false;
      scheduleLoad(false);
    }
  }, [
    hasMore,
    isLoading,
    isPrefetching,
    checkScrollDirection,
    scheduleLoad,
    shouldPauseForVisibility,
  ]);

  useEffect(() => {
    // Check if we're in the browser (important for Next.js SSR)
    if (typeof window === 'undefined' || !supportsIntersectionObserver) return;

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
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  const shouldUseVisibilityPrefetch = prefetchStrategy === "visibility" || prefetchStrategy === "visibility-idle";
  const shouldUseIdlePrefetch = prefetchStrategy === "idle" || prefetchStrategy === "visibility-idle";

  useEffect(() => {
    prefetchOffsetRef.current = prefetchOffsetState;
  }, [prefetchOffsetState]);

  useEffect(() => {
    setPrefetchOffsetState(prefetchOffset);
  }, [prefetchOffset]);

  useEffect(() => {
    if (typeof window === "undefined" || !adaptivePrefetch) return;

    lastScrollY.current = window.scrollY;
    lastScrollTime.current = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      const dt = Math.max(1, now - lastScrollTime.current);
      const speed = dy / dt;

      const nextOffset = Math.min(
        prefetchMaxOffset,
        Math.max(
          prefetchMinOffset,
          Math.round(prefetchOffset + speed * prefetchSpeedFactor)
        )
      );

      if (Math.abs(nextOffset - prefetchOffsetRef.current) >= 50) {
        setPrefetchOffsetState(nextOffset);
      }

      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    adaptivePrefetch,
    prefetchOffset,
    prefetchMinOffset,
    prefetchMaxOffset,
    prefetchSpeedFactor,
  ]);

  // Prefetch observer - triggers earlier to prefetch next page
  useEffect(() => {
    if (typeof window === 'undefined' || !enablePrefetch || !shouldUseVisibilityPrefetch || !supportsIntersectionObserver) return;

    // Calculate rootMargin for prefetch based on scroll direction and reverse mode
    let prefetchRootMargin;
    if (reverse) {
      // For reverse mode (content loads at top)
      prefetchRootMargin = scrollDirection === 'up' || scrollDirection === 'both'
        ? `0px 0px ${prefetchOffsetState}px 0px`
        : `${prefetchOffsetState}px 0px 0px 0px`;
    } else {
      // For normal mode (content loads at bottom)
      prefetchRootMargin = scrollDirection === 'down' || scrollDirection === 'both'
        ? `0px 0px ${prefetchOffsetState}px 0px`
        : `${prefetchOffsetState}px 0px 0px 0px`;
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
      if (prefetchThrottleTimer.current) {
        clearTimeout(prefetchThrottleTimer.current);
      }
    };
  }, [
    handlePrefetchIntersection,
    enablePrefetch,
    prefetchOffsetState,
    reverse,
    scrollDirection,
    shouldUseVisibilityPrefetch,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !enablePrefetch || !shouldUseIdlePrefetch || !supportsIntersectionObserver) return;
    if (!hasMore || isLoading || isPrefetching || hasPrefetched.current) return;
    if (shouldPauseForVisibility()) return;

    let cancelled = false;
    let idleId = null;

    const triggerPrefetch = () => {
      if (cancelled) return;
      if (!hasMore || isLoading || isPrefetching || hasPrefetched.current) return;
      handleLoadMore(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(triggerPrefetch, { timeout: 1000 });
    } else {
      idleId = setTimeout(triggerPrefetch, 200);
    }

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function" && typeof idleId === "number") {
        window.cancelIdleCallback(idleId);
      } else if (idleId) {
        clearTimeout(idleId);
      }
    };
  }, [
    enablePrefetch,
    shouldUseIdlePrefetch,
    hasMore,
    isLoading,
    isPrefetching,
    handleLoadMore,
    shouldPauseForVisibility,
  ]);

  // Initial load on mount if enabled
  useEffect(() => {
    if (initialLoad && hasMore && typeof window !== 'undefined') {
      handleLoadMore();
    }
  }, [initialLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (enableAbort && abortOnUnmount) {
        abortActiveRequest();
      }
    };
  }, [enableAbort, abortOnUnmount, abortActiveRequest]);

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

  const handleManualLoadMore = () => {
    if (isLoading || isPrefetching) return;
    handleLoadMore(false);
  };

  const renderManualLoadMore = () => {
    if (error && retryOnError) {
      return renderLoader();
    }

    if (manualLoadMore) {
      return manualLoadMore({
        onClick: handleManualLoadMore,
        isLoading: isLoading || isPrefetching,
        error,
      });
    }

    const label = isLoading || isPrefetching ? manualLoadMoreLoadingLabel : manualLoadMoreLabel;

    return (
      <button
        type="button"
        onClick={handleManualLoadMore}
        className={manualLoadMoreClassName}
        disabled={isLoading || isPrefetching}
        style={{
          padding: '10px 16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || isPrefetching ? 'not-allowed' : 'pointer',
          opacity: isLoading || isPrefetching ? 0.7 : 1,
        }}
      >
        {label}
      </button>
    );
  };

  const content = reverse ? (
    <>
      {hasMore && (
        <>
          {supportsIntersectionObserver ? (
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
          ) : (
            <div
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
              {renderManualLoadMore()}
            </div>
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
          {supportsIntersectionObserver ? (
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
          ) : (
            <div
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
              {renderManualLoadMore()}
            </div>
          )}
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
