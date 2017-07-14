Telegram bot for fetching last price of trading pairs on multiple exchanges.

## Install
Install dependencies using `$ npm i`

Contact [BotFather](https://telegram.me/BotFather) and generate your test bot API key

`$ touch env.js`

```js
module.exports = {
  ccjBotToken: "API_KEY"
};
```

Enter your api key and run `$ node index.js`

## Todo
- Charts
- Add exchanges: Coinexchange, Poswallet
- Better way of fetching exchanges
- New structure of receiving and sending messages..
