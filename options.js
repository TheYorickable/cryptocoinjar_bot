module.exports = {
  token: '440146541:AAHi27qwJArLJ-o4qrncYM0mYGC_4y97IAk',
  // token: '429017792:AAEEFiDAMmwvfQFbrwzNrpj8WWQ61y1DO1I',
  intervalChats: [
    -237161017,
    114791921
  ],
  fanboyApproved: [

  ],
  scamcoins: [
    'DGB',
  ],
  apis: [
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
    },
    {
      name: 'cryptopia',
      ticker: 'https://www.cryptopia.co.nz/api/GetMarkets'
    }
  ]
};
