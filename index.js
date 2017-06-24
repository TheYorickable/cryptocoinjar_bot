const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = require('./options');
const utils = require('./utils');
const ua = require('universal-analytics');
const token = '';

const bot = new TelegramBot(options.token, {polling: true});

const ticker = {
  poloniex: null,
  bittrex: null,
  novaexchange: null
};


function sendMessage(chatId, message) {

  var markup = '';

  message.forEach((txt) => {
    markup += txt + '\n';
  });

  bot.sendMessage(chatId, markup, {'parse_mode': 'Markdown'});
}

function getBittrexData(coin) {
  if (ticker.bittrex['BTC_' + coin] !== undefined) {
    return ticker.bittrex['BTC_' + coin];
  } else {
    return null;
  }
}

function getPoloniexData(coin) {
  if (ticker.poloniex['BTC_' + coin] !== undefined) {
    return ticker.poloniex['BTC_' + coin];
  } else {
    return null;
  }
}

function getNovaexchangeData(coin) {
  if (ticker.novaexchange['BTC_' + coin] !== undefined) {
    return ticker.novaexchange['BTC_' + coin];
  } else {
    return null;
  }}

function round(num) {
  return Math.round(num * 100) / 100;
}

bot.onText(/\/p (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const coin = match[1].toUpperCase();

  const poloniexData = getPoloniexData(coin);
  const bittrexData = getBittrexData(coin);
  const novaexchangeData = getNovaexchangeData(coin);

  var message = [];

  if (poloniexData !== null) {
      message.push('➡️ Poloniex');
      message.push('*' + poloniexData.last + '  /  ' + utils.getPercentage(poloniexData.percentChange) + '*');
      message.push('High / Low: ' + poloniexData.high + ' / ' + poloniexData.low);
      message.push('Volume: ' + round(poloniexData.volume) + ' BTC');
      message.push('');
  }

  if (bittrexData !== null) {
    var percentChangeBittrex = Math.round((bittrexData.Last / bittrexData.PrevDay * 100 - 100) * 100)/100;

    message.push('➡️ Bittrex');
    message.push('*' + bittrexData.last + '  /  ' + utils.getPercentage(bittrexData.percentChange) + '*');
    message.push('High / Low: ' + bittrexData.high + ' / ' + bittrexData.low);
    message.push('Volume: ' + round(bittrexData.volume) + ' BTC');
    message.push('');
  }

  if (novaexchangeData !== null) {
    message.push('➡️ Novaexchange');
    message.push('*' + novaexchangeData.last + '  /  ' + utils.getPercentage(novaexchangeData.percentChange) + '*');
    message.push('High / Low: ' + novaexchangeData.high + ' / ' + novaexchangeData.low);
    message.push('Volume: ' + round(novaexchangeData.volume) + ' BTC');
    message.push('');
  }

  if (message.length !== 0) {
    message.unshift('');
    message.unshift('📈 BTC / ' + coin + ' 24hr');
  }

  if (options.fanboyApproved.indexOf(coin) !== -1) {
    message.push(coin + ' is Fanboy Approved 🔥');
  }

  if (message.length === 0) {
    message.push(coin + ' was not found on Poloniex / Bittrex / Novaexchange');
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
