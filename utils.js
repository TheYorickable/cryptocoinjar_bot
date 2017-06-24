var utils = {
  getPercentage: (perc) => {
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
  },

  parseApi: {
    poloniex: (body) => {
      var data = [];

      Object.keys(body).forEach((item) => {
        data[item] = {
          last: body[item].last,
          percentChange: Math.round((body[item].percentChange * 100) * 100) / 100,
          high: body[item].high24hr,
          low: body[item].low24hr,
          volume: body[item].baseVolume
        };
      });

      return data;
    },
    bittrex: (body) => {
      var data = [];

      body.result.forEach((market) => {
        var regex = /[a-zA-Z]+/g;
        var result = market.MarketName.match(regex);
        data[result[0] + '_' + result[1]] = {
          last: market.Last,
          percentChange: Math.round((market.Last / market.PrevDay * 100 - 100) * 100)/100,
          high: market.High,
          low: market.Low,
          volume: market.BaseVolume
        };
      });

      return data
    },

    novaexchange: (body) => {
      var data = [];
      body.markets.forEach((market) => {
        data[market.marketname] = {
          last: market.last_price,
          percentChange: Math.round((market.change24h) * 100) / 100,
          high: market.high24h,
          low: market.low24h,
          volume: market.volume24h
        }
      })

      return data;
    },

    cryptopia: (body) => {
      var data = [];

      body.Data.forEach((market) => {
        var regex = /[a-zA-Z]+/g;
        var result = market.Label.match(regex);
        data[result[0] + '_' + result[1]] = {
          last: market.LastPrice,
          percentChange: market.Change,
          high: market.High,
          low: market.Low,
          volume: market.BuyVolume
        };
      });

      return data;
    }
  },

  parseTicker: (apiName, body) => {
    switch (apiName) {
      case 'poloniex':
        return utils.parseApi.poloniex(body);
        break;
      case 'bittrex':
        return utils.parseApi.bittrex(body);
        break;
      case 'novaexchange':
        return utils.parseApi.novaexchange(body);
        break;
      case 'cryptopia':
        return utils.parseApi.cryptopia(body);
        break;
      default:
    }

    return body;
  },

  getTickerData(data, base, coin) {
    if (data[base + '_' + coin] !== undefined) {
      return data[base + '_' + coin];
    } else {
      return null;
    }
  }
}


module.exports = utils;
