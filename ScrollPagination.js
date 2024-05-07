// ScrollPagination.js
import React, { useEffect, useRef, useState } from 'react';

const ScrollPagination = ({ children, loadMore, hasMore }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <div>
      {children}
      {hasMore && <div ref={loaderRef}>Loading more...</div>}
    </div>
  );
};

export default ScrollPagination;
