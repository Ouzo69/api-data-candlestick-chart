// ================ SECTION 1: Default values, data structures and related functions ================

function getDefaultMarketSymbol() {
  return "BTC-USDT";
}

function getCurrentMarketSymbol() {
  var currentMarketSymbol = document.getElementById("binanceMarket").innerText;
  return currentMarketSymbol;
}

function getDefaultTimeInterval() {
  return "1d";
}

function getCurrentTimeInterval() {
  var currentTimeIntervalText = document.getElementById("timeFrame").innerText;
  var currentTimeInterval = timeTextToCode(currentTimeIntervalText);
  return currentTimeInterval;
}

function getDefaultNumberOfDatasets() {
  return 150;
}

function getMaxNumberOfHighCaps() {
  return 20;
}

function getBaseCurrencies() {
  return ["BTC", "ETH", "USDT"];
}

function getSMAs() {
//This array of objects defines all SMAs.
  var SMAs = [{name:  "SMA25", value:  25, color: '#E74C3C'},
              {name:  "SMA50", value:  50, color: '#2471A3'},
              {name: "SMA100", value: 100, color: '#8E44AD'}];
  return SMAs;
}

function getTimeIntervals() {
//This array of objects defines all time intervals on Binance:
//name is for API calls and text is for time frames and buttons text.
  var timeIntervals = [{name:"1m", text:"1 min"},
                       {name:"3m", text:"3 min"},
                       {name:"5m", text:"5 min"},
                       {name:"15m", text:"15 min"},
                       {name:"30m", text:"30 min"},
                       {name:"1h", text:"1 hour"},
                       {name:"2h", text:"2 hours"},
                       {name:"4h", text:"4 hours"},
                       {name:"6h", text:"6 hours"},
                       {name:"8h", text:"8 hours"},
                       {name:"12h", text:"12 hours"},
                       {name:"1d", text:"1 day"},
                       {name:"3d", text:"3 days"},
                       {name:"1w", text:"1 week"},
                       {name:"1M", text:"1 month"}];
  return timeIntervals;
}

//Receives the name of a timeIntervals object and returns its text.
function timeCodeToText(timeInterval) {
  timeCodes = getTimeIntervals();
  for (var i = 0; i < timeCodes.length; i++) {
    if (timeInterval == timeCodes[i].name) {
      return timeCodes[i].text;
    }
  }
  return "No such interval code!";
}

//Receives the text of a timeIntervals object and returns its name.
function timeTextToCode(timeInterval) {
  timeCodes = getTimeIntervals();
  for (var i = 0; i < timeCodes.length; i++) {
    if (timeInterval == timeCodes[i].text) {
      return timeCodes[i].name;
    }
  }
  return "No such interval text!";
}

// ================ SECTION 2: Creating HTML content ================

//Creates the group of buttons for selecting different time frames
function createButtonGroup() {
  var arrButton = getTimeIntervals();
  for (var i = 0; i < arrButton.length; i++) {
    document.write("<button class=button id=\"interval_" + arrButton[i].name +
                   "\" onclick=\"callApiAndPlot(getCurrentMarketSymbol(), '"
                   + arrButton[i].name + "', numberOfDatasets)\">"
                   + arrButton[i].text + "</button>");
  }
}

// Creating the sliders for toggling the Simple Moving Averages (SMAs)
function createSliders() {
  var arrSMA = getSMAs();
  for (i = 0; i < arrSMA.length; i++) {
    var nameSMA = arrSMA[i].name;
    document.write("<th>");
    document.write("  <div class=\"toggle text\">");
    document.write("    <label class=\"checkbox-inline\">");
    document.write("      <span style=\"color:" + arrSMA[i].color + "\">" + nameSMA + "</span>");
    document.write("      <input id=\"" + nameSMA + "\" name=\"" + nameSMA + "\" type=\"checkbox\" checked>");
    document.write("      <span class=\"slider\"></span>");
    document.write("    </label>");
    document.write("  </div>");
    document.write("</th>");
  }
}

//Creating dummy drop down menus for base currencies, which are corrected later on.
function createDropDownMenus(baseCurrencies) {
  var j;
  for (j = 0; j < baseCurrencies.length; j++) {

      document.write("<div class=\"dropdown\">");
      document.write("  <button class=\"dropbtn\">" + baseCurrencies[j]);
      document.write("    <i class=\"fa fa-caret-down\"></i>");
      document.write("  </button>");
      document.write("  <div class=\"dropdown-content\">");
      var i;
      for (i = 0; i < getMaxNumberOfHighCaps(); i++) {
        document.write("<a id=\"" + baseCurrencies[j] + i + "\" " +
                       "onclick=setMarketSymbol(this.text+'-" + baseCurrencies[j] + "',getCurrentTimeInterval())" +
                       ">" + baseCurrencies[j] + i + "</a>");
      }
      document.write("  </div>");
      document.write("</div>");
  }
}

// ================ SECTION 3: API calls on Coinranking and Binance  ================

//Getting high market cap coins from Coinranking.
async function getHighCapCoins() {
  var api_url = 'https://api.coinranking.com/v1/public/coins?'
                + 'limit=' + getMaxNumberOfHighCaps();
  const response = await fetch(api_url);
  const apiData = await response.json();
  var highCapCoins = [];
  for (let i=0; i<apiData.data.coins.length; i++) {
    var currentSymbol = apiData.data.coins[i].symbol; //"MIOTA" is named "IOTA" on Binance
    (currentSymbol != "MIOTA" ? highCapCoins.push(currentSymbol) : highCapCoins.push("IOTA"));
  }
  return highCapCoins;
}

//Getting all available market pairs at Binance.
async function getBinanceMarketPairs() {
  var api_url = 'https://api.binance.com/api/v3/exchangeInfo';
  const response = await fetch(api_url);
  const apiData = await response.json();
  var binanceMarketPairs = [];
  for (let i=0; i<apiData.symbols.length; i++) {
     var currentSymbol = apiData.symbols[i].symbol;
     binanceMarketPairs.push(currentSymbol);
  }
  return binanceMarketPairs;
}

async function getKlines(marketSymbol, timeInterval, numberOfDatasets) {
  var api_url = 'https://api.binance.com/api/v3/klines?symbol=' + marketSymbol
                 + '&interval=' + timeInterval
                 + '&limit=' + numberOfDatasets;
  const response = await fetch(api_url);
  const apiData = await response.json();
  var timestamp = [];
  var openPrice = [];
  var highPrice = [];
  var lowPrice = [];
  var closePrice = [];
  for (var index in apiData){
    timestamp[index]  = new Date(apiData[index][0]);
    openPrice[index]  = apiData[index][1];
    highPrice[index]  = apiData[index][2];
    lowPrice[index]   = apiData[index][3];
    closePrice[index] = apiData[index][4];
  }
  updateTimeFrameText(timeInterval);
  return [timestamp, openPrice, highPrice, lowPrice, closePrice];
}

// ================ SECTION 4: Functions using the API calls  ================

//Correcting drop down menus or deleting menu entry if market pair is not available.
async function getDropDownMenu(baseCurrencies) {
  const binanceMarketPairs = await getBinanceMarketPairs();
  const highCapCoin = await getHighCapCoins();
  for (var j = 0; j < baseCurrencies.length; j++) {
    for (var i = 0; i < getMaxNumberOfHighCaps(); i++) {
      var parsedMarketSymbol = parseMarketSymbol(highCapCoin[i] + '-' + baseCurrencies[j]);
      if (binanceMarketPairs.includes(parsedMarketSymbol)) {
        $("#" + baseCurrencies[j] + i).text(highCapCoin[i]);
      }
      else {
        $("#" + baseCurrencies[j] + i).remove();
      }
    }
  }
}

//Getting the market data, calculating SMAs and calling makePlot function
async function callApiAndPlot(marketSymbol=getDefaultMarketSymbol(),
                              timeInterval=getDefaultTimeInterval(),
                              numberOfDatasets=getDefaultNumberOfDatasets()) {
  marketSymbol = parseMarketSymbol(marketSymbol, "");
  apiData = await getKlines(marketSymbol, timeInterval, numberOfDatasets);
  timestamp = apiData[0];
  openPrice = apiData[1];
  highPrice = apiData[2];
  lowPrice  = apiData[3];
  closePrice= apiData[4];
  var arrSMA = getSMAs();
  var dataSMA = [];
  var checkboxSMA = [];
  for (i = 0; i < arrSMA.length; i++) {
    //Calculating all SMAs
    dataSMA.push(calcSMA(timestamp, closePrice, arrSMA[i].value));
    //Getting states of the sliders (checkbuttons)
    checkboxSMA.push(document.getElementById(arrSMA[i].name).checked);
  }
  makePlot(timestamp, marketSymbol,
           openPrice, highPrice, lowPrice, closePrice,
           dataSMA, checkboxSMA);
}

//Update website content after choosing new market pair or new time interval
function setMarketSymbol(marketSymbol, timeInterval) {
  const marketSymbolText = parseMarketSymbol(marketSymbol, '-');
  $("#binanceMarket").text(marketSymbolText);
  updateTimeFrameText(timeInterval);
  callApiAndPlot(marketSymbol, timeInterval, numberOfDatasets);
}

// ================ SECTION 5: Functions for calculating the SMAs  ================

//Calculates the sum of the given array
function arraySum(arrSMA) {
  var arrLength = arrSMA.length;
  var sumOfArray = 0;
  while (arrLength--) {
    sumOfArray += Number(arrSMA[arrLength]);
  }
  return sumOfArray;
}

//Calculates the average of an array range
function calcAverage(arrSMA, index, range) {
  return arraySum(arrSMA.slice(index - range, index)) / range;
}

//Calculates Simple Moving Average (SMA)
function calcSMA(arrTime, arrSMA, range) {
  var result = [];
  var timestamps = [];
  var arrLength = arrSMA.length + 1;
  var index = range - 1;
  while (++index < arrLength) {
    result.push(calcAverage(arrSMA, index, range));
    timestamps.push(arrTime[index]);
  }
  return [timestamps, result];
}

// ================ SECTION 6: The makePlot function  ================

function makePlot(timestamp, marketSymbol,
                  openPrice, highPrice, lowPrice, closePrice,
                  dataSMA, checkboxSMA) {
  var trace1 = {
    x: timestamp,
    name : marketSymbol,
    close: closePrice,
    decreasing: {line: {color: '#FF1A1A'}},
    high: highPrice,
    increasing: {line: {color: '#77B41F'}},
    line: {color: 'rgba(31,119,180,1)'},
    low: lowPrice,
    open: openPrice,
        type: 'candlestick',
    xaxis: 'x',
    yaxis: 'y',
    showlegend: true
  };

  var arrSMA = getSMAs();
  var arrTrace = [];
  arrTrace.push(trace1);
  for (i = 0; i < dataSMA.length; i++) {
    var trace = {
      visible : checkboxSMA[i],
      name : arrSMA[i].name,
      x: dataSMA[i][0],
      y: dataSMA[i][1],
      type: 'scatter',
      line: {color: arrSMA[i].color}
    }
    arrTrace.push(trace);
  }

  var data = arrTrace;

  var layout = {
    dragmode: 'zoom',
    margin: {
      r: 10,
      t: 25,
      b: 40,
      l: 60
    },
    showlegend: true,
    xaxis: {
      autorange: true,
      domain: [0, 1],
      range: [],
      rangeslider: {range: []},
      title: 'Date',
      type: 'date'
    },
    yaxis: {
      autorange: true,
      domain: [0, 1],
      range: [],
      type: 'linear'
    }
  };
  var config = {responsive: true}
  Plotly.newPlot('myDiv', data, layout, config);
}

// ================ SECTION 7: Helper functions  ================

//Updating the time frame text in the header
function updateTimeFrameText(timeInterval) {
  const timeFrameText = timeCodeToText(timeInterval);
  $("#timeFrame").text(timeFrameText);
}

//The asset with the highest priority is always in the rear part.
//For example not USDTBTC, but BTCUSDT is the correct market pair.
function getPriority(currencyName) {
  switch (currencyName) {
  case "USDT":
    priority = 7;
    break;
  case "USDC":
    priority = 6;
    break;
  case "BTC":
    priority = 5;
    break;
  case "ETH":
    priority = 4;
    break;
  case "BNB":
    priority = 3;
    break;
  case "XRP":
    priority = 2;
    break;
  case "TRX":
    priority = 1;
    break;
  default:
    priority = 0;
  }
  return priority;
}

//This function returns a Binance market pair in the correct order.
function parseMarketSymbol(rawMarketSymbol, delimiter = "") {
  var quoteCurrency = {name:rawMarketSymbol.split('-')[0], priority:0};
  var baseCurrency  = {name:rawMarketSymbol.split('-')[1], priority:0};
  quoteCurrency.priority = getPriority(quoteCurrency.name);
  baseCurrency.priority  = getPriority(baseCurrency.name);
  if (quoteCurrency.priority > baseCurrency.priority) {
    return baseCurrency.name + delimiter + quoteCurrency.name;
  }
  else {
    return quoteCurrency.name + delimiter + baseCurrency.name;
  }
}

// ================ SECTION 8: Calling the functions  ================

//Correcting the dummy entries of the drop down menus
getDropDownMenu(getBaseCurrencies());

//Calling API and plotting with default values
callApiAndPlot(marketSymbol=getDefaultMarketSymbol(),
               timeInterval=getDefaultTimeInterval(),
               numberOfDatasets=getDefaultNumberOfDatasets());
