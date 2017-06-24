const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = require('./options');
const utils = require('./utils');
const ua = require('universal-analytics');

const bot = new TelegramBot(options.token, {polling: true});

const ticker = {
  poloniex: null,
  bittrex: null,
  novaexchange: null,
  cryptopia: null
};


function sendMessage(chatId, message) {

  var markup = '';

  message.forEach((txt) => {
    markup += txt + '\n';
  });

  bot.sendMessage(chatId, markup, {'parse_mode': 'Markdown'});
}

function round(num) {
  return Math.round(num * 100) / 100;
}

bot.onText(/\/p (.+)/, (msg, match) => {
  var chatId = msg.chat.id;
  var coin = match[1].toUpperCase();

  var regex = /[a-zA-Z]+/g;
  var pairs = coin.match(regex);

  var base = 'BTC';

  if (pairs.length === 2) {
    base = pairs[0];
    coin = pairs[1];
  }

  const poloniexData = utils.getTickerData(ticker.poloniex, base, coin);
  const bittrexData = utils.getTickerData(ticker.bittrex, base, coin);
  const novaexchangeData = utils.getTickerData(ticker.novaexchange, base, coin);
  const cryptopiaData = utils.getTickerData(ticker.cryptopia, coin, base);

  var message = [];
  if (poloniexData !== null) {
      message.push('➡️ Poloniex');
      message.push('*' + poloniexData.last + ' ' + base + '  /  ' + utils.getPercentage(poloniexData.percentChange) + '*');
      message.push('High / Low: ' + poloniexData.high + ' / ' + poloniexData.low);
      message.push('Volume: ' + round(poloniexData.volume) + ' ' + base);
      message.push('');
  }

  if (bittrexData !== null) {
    message.push('➡️ Bittrex');
    message.push('*' + bittrexData.last + ' ' + base + '  /  ' + utils.getPercentage(bittrexData.percentChange) + '*');
    message.push('High / Low: ' + bittrexData.high + ' / ' + bittrexData.low);
    message.push('Volume: ' + round(bittrexData.volume) + ' ' + base);
    message.push('');
  }

  if (novaexchangeData !== null) {
    message.push('➡️ Novaexchange');
    message.push('*' + novaexchangeData.last + ' ' + base + '  /  ' + utils.getPercentage(novaexchangeData.percentChange) + '*');
    message.push('High / Low: ' + novaexchangeData.high + ' / ' + novaexchangeData.low);
    message.push('Volume: ' + round(novaexchangeData.volume) + ' ' + base);
    message.push('');
  }

  if (cryptopiaData !== null) {
    message.push('➡️ Cryptopia');
    message.push('*' + cryptopiaData.last + ' ' + base + '  /  ' + utils.getPercentage(cryptopiaData.percentChange) + '*');
    message.push('High / Low: ' + cryptopiaData.high + ' / ' + cryptopiaData.low);
    message.push('Volume: ' + round(cryptopiaData.volume) + ' ' + base);
    message.push('');
  }

  if (message.length !== 0) {
    message.unshift('');
    message.unshift('📈 ' + base + ' / ' + coin + ' 24hr');
  }

  if (options.fanboyApproved.indexOf(coin) !== -1) {
    message.push(coin + ' is Fanboy Approved 🔥');
  }

  if (options.scamcoins.indexOf(coin) !== -1) {
    message.push('⚠️ ' + coin + ' is most likely a scamcoin ⚠️');
  }

  if (message.length === 0) {
    message.push(' was not found on Poloniex / Bittrex / Novaexchange / Cryptopia');
  }

  sendMessage(chatId, message);
});

bot.on('message', (msg) => {
  var chatId = msg.chat.id;
  var visitor = ua('UA-99595475-3', msg.from.id, {https: true});
  console.log('Message received');
  visitor.event("Message", "Received", 'aap', 'gaap').send();
});

setInterval(() => {
  options.apis.forEach((api) => {
    request(api.ticker, function (error, response, body) {
      ticker[api.name] = utils.parseTicker(api.name, JSON.parse(body));
    });

  })
}, 5000);
