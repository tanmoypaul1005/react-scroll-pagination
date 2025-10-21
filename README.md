<h1 align="center">Welcome to reactjs-scroll-pagination 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/reactjs-scroll-pagination" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/reactjs-scroll-pagination.svg">
  </a>
  <a href="https://github.com/tanmoypaul1005/react-scroll-pagination#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/tanmoypaul1005/react-scroll-pagination/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/tanmoypaul1005/react-scroll-pagination/blob/master/LICENSE" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/github/license/tanmoypaul1005/reactjs-scroll-pagination" />
  </a>
</p>

> A powerful, lightweight React component for infinite scroll pagination that works seamlessly with React and Next.js applications. Features include error handling, retry mechanism, custom loaders, scroll direction detection, and much more!

## ✨ Features

- 🚀 **Next.js SSR Compatible** - Works perfectly with server-side rendering
- 🎯 **TypeScript Support** - Fully typed for better developer experience
- ⚡ **Performance Optimized** - Uses IntersectionObserver API for efficient scroll detection
- 🔄 **Error Handling** - Built-in error handling with retry functionality
- 🎨 **Customizable** - Highly customizable loaders, messages, and styles
- 📱 **Mobile Friendly** - Works great on all devices
- 🔍 **Scroll Direction Detection** - Load more based on scroll direction
- ⏱️ **Debouncing** - Prevent multiple rapid API calls
- 🔁 **Reverse Mode** - Load content at the top (useful for chat apps)
- 🎭 **Custom Loaders** - Use your own loading components
- 💪 **Lightweight** - No heavy dependencies

## Install

```sh
npm install reactjs-scroll-pagination
```

or

```sh
yarn add reactjs-scroll-pagination
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import ScrollPagination from 'reactjs-scroll-pagination';

const MyComponent = () => {
  const [data, setData] = useState([1, 2, 3, 4, 5]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    // Simulate API call
    setTimeout(() => {
      const newData = [...data, ...Array(5).fill(0).map((_, i) => data.length + i + 1)];
      setData(newData);
      if (newData.length >= 50) setHasMore(false);
    }, 1000);
  };

  return (
    <div>
      <ScrollPagination 
        loading={<div>Loading more...</div>} 
        loadMore={loadMore} 
        hasMore={hasMore}
      >
        {data.map((item, index) => (
          <div key={index}>Item {item}</div>
        ))}
      </ScrollPagination>
    </div>
  );
};

export default MyComponent;
```

## Advanced Usage with Next.js

```jsx
'use client'; // For Next.js 13+ App Router

import React, { useState } from 'react';
import ScrollPagination from 'reactjs-scroll-pagination';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    try {
      const response = await fetch(`/api/products?page=${page}`);
      const newProducts = await response.json();
      
      setProducts([...products, ...newProducts]);
      setPage(page + 1);
      
      if (newProducts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error; // Will trigger error handling
    }
  };

  return (
    <ScrollPagination 
      loadMore={loadMore}
      hasMore={hasMore}
      loader={<div className="spinner">Loading...</div>}
      endMessage={<p>No more products to load!</p>}
      threshold={0.5}
      rootMargin="200px"
      debounceMs={300}
      onError={(error) => console.error('Error loading data:', error)}
      retryOnError={true}
    >
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </ScrollPagination>
  );
};
```

## API Reference

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | ReactNode | Yes | - | The content to be rendered |
| `loadMore` | () => void \| Promise<void> | Yes | - | Function to load more data |
| `hasMore` | boolean | Yes | - | Whether there is more data to load |
| `loading` | ReactNode | No | "Loading more..." | Loading message/component |
| `loader` | ReactNode \| (() => ReactNode) | No | null | Custom loader component |
| `endMessage` | ReactNode \| (() => ReactNode) | No | null | Message shown when no more data |
| `threshold` | number | No | 0.1 | Intersection observer threshold (0-1) |
| `rootMargin` | string | No | "10px" | Margin around the root element |
| `reverse` | boolean | No | false | Load content at the top instead of bottom |
| `scrollDirection` | 'up' \| 'down' \| 'both' | No | 'down' | Trigger loading based on scroll direction |
| `onError` | (error: Error) => void | No | null | Error callback function |
| `retryOnError` | boolean | No | false | Show retry button on error |
| `className` | string | No | "" | CSS class for the wrapper div |
| `loaderClassName` | string | No | "" | CSS class for the loader div |
| `initialLoad` | boolean | No | false | Trigger loadMore on component mount |
| `debounceMs` | number | No | 0 | Debounce time in milliseconds |

## Examples

### With Custom Loader

```jsx
<ScrollPagination 
  loadMore={loadMore}
  hasMore={hasMore}
  loader={
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  }
>
  {children}
</ScrollPagination>
```

### With End Message

```jsx
<ScrollPagination 
  loadMore={loadMore}
  hasMore={hasMore}
  endMessage={
    <div className="text-center py-4">
      <p>🎉 You've reached the end!</p>
    </div>
  }
>
  {children}
</ScrollPagination>
```

### With Error Handling and Retry

```jsx
<ScrollPagination 
  loadMore={loadMore}
  hasMore={hasMore}
  onError={(error) => {
    console.error('Load failed:', error);
    // Send to error tracking service
  }}
  retryOnError={true}
>
  {children}
</ScrollPagination>
```

### Reverse Mode (Chat Application)

```jsx
<ScrollPagination 
  loadMore={loadMoreMessages}
  hasMore={hasMore}
  reverse={true}
  scrollDirection="up"
>
  {messages.map(msg => <Message key={msg.id} {...msg} />)}
</ScrollPagination>
```

### With Debouncing

```jsx
<ScrollPagination 
  loadMore={loadMore}
  hasMore={hasMore}
  debounceMs={500}
  threshold={0.5}
  rootMargin="100px"
>
  {children}
</ScrollPagination>
```

### With Initial Load

```jsx
<ScrollPagination 
  loadMore={loadMore}
  hasMore={hasMore}
  initialLoad={true}
>
  {children}
</ScrollPagination>
```

## TypeScript Support

This package is written in TypeScript and provides full type definitions:

```tsx
import ScrollPagination, { ScrollPaginationProps } from 'reactjs-scroll-pagination';

const MyComponent: React.FC = () => {
  const props: ScrollPaginationProps = {
    loadMore: async () => { /* ... */ },
    hasMore: true,
    children: <div>Content</div>
  };

  return <ScrollPagination {...props} />;
};
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

Requires support for IntersectionObserver API (available in all modern browsers).

## Contributing

Contributions, issues and feature requests are welcome!

## Author

* Website: https://tanmoy-paul.vercel.app
* Github: [@tanmoypaul1005](https://github.com/tanmoypaul1005)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

This project is [ISC](https://github.com/tanmoypaul1005/react-scroll-pagination/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_