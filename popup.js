class Coin {
  constructor(id, name, coin) {
    this.id = id;
    this.name = name;
    this.coin = coin;
  }
}

const coins = [
  new Coin('bitcoin', 'Bitcoin', 'BTC'),
  new Coin('cosmos', 'Atom', 'ATOM'),
  new Coin('osmosis', 'Osmosis', 'OSMO'),
  new Coin('wrapped-bitcoin', 'Wrapped Bitcoin', 'WBTC'),
  new Coin('weth', 'WETH', 'WETH'),
  new Coin('juno-network', 'JUNO', 'JUNO'),
  new Coin('crypto-com-chain', 'Cronos', 'CRO'),
]

const triangleDown = '\u25BC';
const triangleUp = '\u25B2';

function onError(error) {
  console.error(`Error: ${error}`);
}

function convertToOtherRange(value, min, max, otherMin, otherMax) {
  var converted = (((value - min)/(max - min)) * (otherMax - otherMin)) + otherMin;
  return Math.max(Math.min(converted, otherMax), otherMin);
}

function toRgbHtml(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function generateGetPricesUrl(coinsId, vs_currencies = ['usd'], include_24hr_change = true) {
  return `https://api.coingecko.com/api/v3/simple/price?ids=${coinsId.join(',')}&vs_currencies=${vs_currencies.join(',')}&include_24hr_change=${include_24hr_change}`;
}

// TODO: remove body
function generateCoinRowId(coinId) {
  return coinId;
}

function generateTrendCellId(coinId) {
  return `${coinId}_trend`;
}

function generatePriceCellId(coinId) {
  return `${coinId}_price`;
}

function generateCoinCellId(coinId) {
  return `${coinId}_coin`;
}

function createCoinInfoRow(tbodyRef, coin, price, trend) {
  // Create row
  var row = tbodyRef.insertRow();
  row.id = generateCoinRowId(coin.id);

  // Create Trend cell
  var trendSymbol = trend < 0 ? triangleDown : triangleUp;
  var cell = row.insertCell();
  cell.id = generateTrendCellId(coin.id);
  cell.className = 'tren-cell'
  cell.appendChild(document.createTextNode(`${Number.parseFloat(trend).toFixed(2)}% ${trendSymbol}`));
  
  // Create Price cell
  var cell = row.insertCell();
  cell.id = generatePriceCellId(coin.id);
  cell.appendChild(document.createTextNode(price));

  // Create Coin cell
  var cell = row.insertCell();
  cell.id = generateCoinCellId(coin.id);
  cell.appendChild(document.createTextNode(`(${coin.coin}) ${coin.name}`));
}

function getCoinsPriceAsync(coinsId) {
  return fetch(generateGetPricesUrl(coinsId))
    .then(response => {
      return response.json();
    })
    .catch(onError);
}

function getGradientTrendColor(trendValue, trendMin, trendMax) {
  const redMin = 50;
  const redMax = 200;
  const greenMin = 50;
  const greenMax = 200;

  if (trendValue < 0) {
    var red = convertToOtherRange(Math.abs(trendValue), 0, Math.abs(trendMin), redMin, redMax);
    return toRgbHtml(red, 0, 0);
  }
  else {
    var green = convertToOtherRange(trendValue, 0, trendMax, greenMin, greenMax);
    return toRgbHtml(0, green, 0);
  }
}

function colorTrends(coins, coinsInfo) {
  var trends = Object.values(coinsInfo).map(coinInfo => coinInfo.usd_24h_change)
  var trendMin = Math.min(...trends);
  var trendMax = Math.max(...trends);
  for (let coin of coins) {
    var trendValue = coinsInfo[coin.id].usd_24h_change;
    var color = getGradientTrendColor(trendValue, trendMin, trendMax);
    document.getElementById(generateTrendCellId(coin.id)).style.color = color;
  }
}

function main() {
  var tbodyRef = document.getElementById('priceTable').getElementsByTagName('tbody')[0];
  getCoinsPriceAsync(coins.map(coin => coin.id))
    .then(coinsInfo => {
      for (let coin of coins) {
        var coinInfo = coinsInfo[coin.id];
        createCoinInfoRow(tbodyRef, coin, coinInfo.usd, coinInfo.usd_24h_change);
      }
      colorTrends(coins, coinsInfo);
    })
    .catch(onError);
}

document.addEventListener("DOMContentLoaded", main);
