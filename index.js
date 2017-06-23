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

bot.onText(/\/p (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const coin = match[1].toUpperCase();

  const poloniexData = getPoloniexData(coin);
  const bittrexData = getBittrexData(coin);
  const novaexchangeData = getNovaexchangeData(coin);

  var message = [];

  if (poloniexData !== null) {
      message.push('Poloniex: BTC / ' + coin);
      message.push('Last price: ' + poloniexData.last);
      message.push('24hr change: ' + poloniexData.percentChange);
      message.push('24hr high / low: ' + poloniexData.high24hr + ' / ' + poloniexData.low24hr);
      message.push('');
  } else {
    message.push('Poloniex: BTC / ' + coin + ' Not found');
  }


  if (bittrexData !== null) {
    let percentChangeBittrex = Math.round((bittrexData.Last / bittrexData.PrevDay * 100 - 100) * 100)/100;

    message.push('Bittrex: BTC / ' + coin);
    message.push('Last price: ' + bittrexData.Last);
    message.push('24hr change: ' + percentChangeBittrex);
    message.push('24hr high / low: ' + bittrexData.High + ' / ' + bittrexData.Low);
    message.push('');
  } else {
    message.push('Poloniex: BTC / ' + coin + ' Not found');
  }

  if (novaexchangeData !== null) {
    message.push('Novaexchange: BTC / ' + coin);
    message.push('Last price: ' + novaexchangeData.last_price);
    message.push('24hr change: ' + novaexchangeData.change24h);
    message.push('24hr high / low: ' + novaexchangeData.high24h + ' / ' + novaexchangeData.low24h);
    message.push('');
  } else {
    message.push('Novaexchange: BTC / ' + coin + ' Not found');
  }

  if (fanboyApproved.indexOf(coin) !== -1) {
    message.push(coin + ' is Fanboy Approved 🔥');
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
