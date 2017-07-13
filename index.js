const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = require('./options');
const utils = require('./utils');
const env = require('./env');
const ua = require('universal-analytics');

const bot = new TelegramBot(env.ccjBotToken, {polling: true});

const ticker = {};

function sendMessage(chatId, message) {
  var markup = '';

  message.forEach((txt) => {
    markup += txt + '\n';
  });

  bot.sendMessage(chatId, markup, {'parse_mode': 'Markdown'});
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
      message.push('*' + utils.getNumber(data.last, base) + ' ' + base + '  /  ' + utils.getPercentage(data.percentChange) + '*');
      message.push('High / Low: ' + utils.getNumber(data.high, base) + ' / ' + utils.getNumber(data.low, base));
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
        message.push('*' + utils.getNumber(data.last, base) + ' ' + base + '  /  ' + utils.getPercentage(data.percentChange) + '*');
      }
    });
  })

  sendMessage(chatId, message);
});

bot.onText(/\/bloodbath/, (msg, match) => {
  var chatId = msg.chat.id;
  var message = [];

  options.motivate.slice(-1)[0].forEach((yell) => {
    message.push(yell);
  });

  sendMessage(chatId, message);
});

bot.onText(/\/link/, (msg, match) => {
  var chatId = msg.chat.id;

  var message = [];
  message.push('➡️ CryptoGlobal')
  message.push('')
  message.push(options.groupLink);

  sendMessage(chatId, message);
});

bot.onText(/\/disclaimer/, (msg, match) => {
  var chatId = msg.chat.id;

  var message = [];
  message.push('⚠️ Disclaimer: ' + options.disclaimer);

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
  visitor.event("Message", "Received").send();
});

setInterval(() => {
  options.apis.forEach((api) => {
    request(api.ticker, function (error, response, body) {
      ticker[api.name] = utils.parseTicker(api.name, JSON.parse(body));
    });
  })
}, 5000);


if (typeof env.espBotToken !== 'undefined') {
  const espBot = new TelegramBot(env.espBotToken, {polling: true});

  function espSendMessage(chatId, message) {
    var markup = '';

    message.forEach((txt) => {
      markup += txt + '\n';
    });

    espBot.sendMessage(chatId, markup, {'parse_mode': 'Markdown'});
  }

  function round(num) {
    return Math.round(num * 100) / 100;
  }

  espBot.onText(/\/price/, (msg, match) => {
    var chatId = msg.chat.id;
    var base = 'BTC'

    data = utils.getTickerData(ticker.Novaexchange, base, 'ESP2');

    var message = [];

    if (data !== null) {
      message.push('➡️ ESP: Novaexchange');
      message.push('*' + utils.getNumber(data.last, base) + ' ' + base + '  /  ' + utils.getPercentage(data.percentChange) + '*');
      message.push('High / Low: ' + utils.getNumber(data.high, base) + ' / ' + utils.getNumber(data.low, base));
      message.push('Volume: ' + round(data.volume) + ' ' + base);
      message.push('');
    }

    espSendMessage(chatId, message);
  });
}
