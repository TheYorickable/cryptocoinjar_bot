const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

const token = '429017792:AAEEFiDAMmwvfQFbrwzNrpj8WWQ61y1DO1I';

const bot = new TelegramBot(token, {polling: true});

const intervalChats = [-237161017, 114791921];
const options = {
  host: 'novaexchange.com',
  path: '/remote/v2/market/info/'
};

const ticker = {
  poloniex: null,
  bittrex: null,
  novaexchange: null
};

const fanboyApproved = [
  'NLG',
  'APX',
  'ESP2',
  'XRP'
];

const apis = [
  {
    name: 'poloniex',
    ticker: 'https://poloniex.com/public?command=returnTicker'
  },
  {
    name: 'bittrex',
    ticker: 'https://bittrex.com/api/v1.1/public/getmarketsummaries'
  },
  {
    name: 'novaexchange',
    ticker: 'https://novaexchange.com/remote/v2/markets/'
  }
]


function sendMessage(chatId, message) {

  var markup = '';

  message.forEach((txt) => {
    markup += txt + '\n';
  });

  bot.sendMessage(chatId, markup);
}

function getBittrexData(coin) {
  var coinData = null;

  ticker.bittrex.result.forEach((data) => {
    if (data.MarketName === 'BTC-' + coin) {
      coinData = data;
    }
  })

  return coinData;
}

function getPoloniexData(coin) {
  if (ticker.poloniex['BTC_' + coin] !== undefined) {
    return ticker.poloniex['BTC_' + coin];
  } else {
    return null;
  }
}

function getNovaexchangeData(coin) {
  var coindata = null;

  ticker.novaexchange.markets.forEach((data) => {
    if (data.marketname === 'BTC_' + coin) {
      coindata = data;
    }
  });

  return coindata;
}

function getPercentage(perc) {
  var string = '';

  if (perc >= 0) {
    string += '+' + perc + '% 🔵  ';
  } else {
    string += perc + '% 🔴  ';
  }

  if (perc >= 100) {
    string += '🚀 🌕';
  } else if (perc >= 50) {
    string += '🚀';
  } else if (perc >= 30) {
    string += '🛩☁️';
  } else if (perc >= 15) {
    string += '🚤';
  }

  return string;
}

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
      var percentChangePoloniex = Math.round((poloniexData.percentChange * 100) * 100) / 100;

      message.push('➡️ Poloniex');
      message.push(poloniexData.last + '  /  ' + getPercentage(percentChangePoloniex));
      message.push('High / Low: ' + poloniexData.high24hr + ' / ' + poloniexData.low24hr);
      message.push('Volume: ' + round(poloniexData.baseVolume) + ' BTC');
      message.push('');
  }

  if (bittrexData !== null) {
    const percentChangeBittrex = Math.round((bittrexData.Last / bittrexData.PrevDay * 100 - 100) * 100)/100;

    message.push('➡️ Bittrex');
    message.push(bittrexData.Last + '  /  ' + getPercentage(percentChangeBittrex));
    message.push('high / low: ' + bittrexData.High + ' / ' + bittrexData.Low);
    message.push('Volume: ' + round(bittrexData.Volume) + ' BTC');
    message.push('');
  }

  if (novaexchangeData !== null) {
    message.push('➡️ Novaexchange');
    message.push(novaexchangeData.last_price + '  /  ' + getPercentage(novaexchangeData.change24h));
    message.push('high / low: ' + novaexchangeData.high24h + ' / ' + novaexchangeData.low24h);
    message.push('Volume: ' + round(novaexchangeData.volume24h) + ' BTC');
    message.push('');
  }

  if (message.length !== 0) {
    message.unshift('');
    message.unshift('📈 BTC / ' + coin + ' 24hr');
  }

  if (fanboyApproved.indexOf(coin) !== -1) {
    message.push(coin + ' is Fanboy Approved 🔥');
  }

  if (message.length === 0) {
    message.push(coin + ' was not found on Poloniex / Bittrex / Novaexchange');
  }

  sendMessage(chatId, message);
});

setInterval(() => {
  apis.forEach((api) => {
    request(api.ticker, function (error, response, body) {
      ticker[api.name] = JSON.parse(body);
    });
  })
}, 5000);
