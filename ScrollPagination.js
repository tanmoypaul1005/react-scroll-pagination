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
}) => {
  const loaderRef = useRef(null);
  const debounceTimer = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastScrollY = useRef(0);

  const handleLoadMore = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await loadMore();
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadMore, isLoading, onError]);

  const handleRetry = useCallback(() => {
    setError(null);
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

  const handleIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      if (!checkScrollDirection()) return;

      if (debounceMs > 0) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          handleLoadMore();
        }, debounceMs);
      } else {
        handleLoadMore();
      }
    }
  }, [hasMore, isLoading, checkScrollDirection, debounceMs, handleLoadMore]);

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

  // Initial load on mount if enabled
  useEffect(() => {
    if (initialLoad && hasMore && typeof window !== 'undefined') {
      handleLoadMore();
    }
  }, [initialLoad]); // eslint-disable-line react-hooks/exhaustive-deps

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
      )}
      {!hasMore && renderEndMessage()}
      {children}
    </>
  ) : (
    <>
      {children}
      {hasMore && (
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
