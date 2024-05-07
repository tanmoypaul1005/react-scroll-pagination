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
npm install
```

    <section id="usage">
        <h2>Usage</h2>
        <p>To use the `genie-password-validator` package in your project, follow these steps:</p>
        <ol>
            <li>Import the package into your code:
                <pre><code>const { isStrongPassword } = require("genie-password-validator");</code></pre>
            </li>
            <li>Define the password to be checked and an optional configuration object:
                <pre><code>const password = "YourPassword123!";
const options = {
    minUppercase: 1,
    minLowercase: 1,
    minDigits: 1,
    minSpecialChars: 1,
    minLength: 8,
};</code></pre>
            </li>
            <li>Call the `isStrongPassword` function and pass in the password and options:
                <pre><code>const result = isStrongPassword(password, options);</code></pre>
            </li>
            <li>You can then use the `result` object to handle the validation outcome in your code.
                <pre><code>if (result.isValid) {
    console.log("Password is strong and meets all criteria.");
} else {
    console.log("Password validation failed. Reasons:");
    result.messages.forEach message => {
        console.log(message);
    });
}</code></pre>
            </li>
        </ol>
    </section>

## Author

* Website: https://tanmoy-paul.vercel.app
* Github: [@tanmoypaul1005](https://github.com/tanmoypaul1005)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

This project is [ISC](https://github.com/tanmoypaul1005/react-scroll-pagination/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_