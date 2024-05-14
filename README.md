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

## Install

```sh
npm install reactjs-scroll-pagination
```

## Usage
The reactjs-scroll-pagination component provides a simple way to implement scroll pagination in React applications. Here's how you can use it:

```sh
import React, { useState } from 'react';
import ScrollPagination from 'reactjs-scroll-pagination';

const MyComponent = () => {
  const [data, setData] = useState([1, 2, 3, 4, 5]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    // Fetch more data here...
    // Update 'data' state and set 'hasMore' accordingly
  };

  return (
    <div>
      <ScrollPagination loading="Loading more..." loadMore={loadMore} hasMore={hasMore}>
        {data.map((item) => (
          <div key={item}>Item {item}</div>
        ))}
      </ScrollPagination>
    </div>
  );
};

export default MyComponent;

```

## Author

* Website: https://tanmoy-paul.vercel.app
* Github: [@tanmoypaul1005](https://github.com/tanmoypaul1005)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

This project is [ISC](https://github.com/tanmoypaul1005/react-scroll-pagination/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_