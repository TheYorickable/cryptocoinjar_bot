const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = require('./options');
const utils = require('./utils');
const ua = require('universal-analytics');

const bot = new TelegramBot(options.token, {polling: true});
const ticker = {};

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

  var message = [];

  Object.keys(ticker).forEach((key) => {
    var data = null;

    if (key == 'Cryptopia') {
      data = utils.getTickerData(ticker[key], coin, base);
    } else {
      data = utils.getTickerData(ticker[key], base, coin);
    }

    if (data !== null) {
      message.push('➡️ ' + key);
      message.push('*' + data.last + ' ' + base + '  /  ' + utils.getPercentage(data.percentChange) + '*');
      message.push('High / Low: ' + data.high + ' / ' + data.low);
      message.push('Volume: ' + round(data.volume) + ' ' + base);
      message.push('');
    }
  });

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

bot.onText(/\/fancoins/, (msg, match) => {
  var chatId = msg.chat.id;
  var base = 'BTC';

  var message = [];

  options.fanboyApproved.forEach((coin) => {
    message.push('📈 *' + coin + '* 24hr');
    Object.keys(ticker).forEach((key) => {
      var data = null;
      if (key == 'Cryptopia') {
        data = utils.getTickerData(ticker[key], coin, base);
      } else {
        data = utils.getTickerData(ticker[key], base, coin);
      }
      if (data !== null) {
        message.push(key + ':');
        message.push('*' + data.last + ' ' + base + '  /  ' + utils.getPercentage(data.percentChange) + '*');
      }
    });
  })

  sendMessage(chatId, message);
});

bot.onText(/\/bloodbath/, (msg, match) => {
  var chatId = msg.chat.id;

  var message = [];

  message.push(options.motivate[0]);

  sendMessage(chatId, message);
});

bot.on('message', (msg) => {
  var chatId = msg.chat.id;
  var visitor = ua('UA-99595475-3', msg.from.id, {https: true});
  console.log('Message received');
  console.log('From: ' + msg.chat.username)
  console.log('Message: ' + msg.text);
  console.log('Datetime: ' + new Date());
  console.log('--------------------------------');
  visitor.event("Message", "Received", 'aap', 'gaap').send();
});

setInterval(() => {
  options.apis.forEach((api) => {
    request(api.ticker, function (error, response, body) {
      ticker[api.name] = utils.parseTicker(api.name, JSON.parse(body));
    });

  })
}, 5000);
