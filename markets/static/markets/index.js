let socket = undefined;

let data = [0];
let symbol = "BTCUSD";
let askOrders = [];
let bidOrders = [];
let chart = undefined;

const records = [];
const line = [];

messageNumber = 0;

WEBSOCKET_URL = 'wss://stream.binance.us:9443/ws';

document.addEventListener('DOMContentLoaded', function () {

    const results = document.querySelector('#results').textContent;
    const ticker = document.querySelector('#ticker').textContent;

    const jsonObjects = JSON.parse(results);
    const jsonTicker = JSON.parse(ticker);

    populateTable(jsonTicker);

    // We load the charts with initial data
    loadCandleChartData(jsonObjects, records, line);

    //Update current data statics
    updateStatistics(records);

    // Creating the initial chart configuration
    options = configureChart(line, records);

    // Creating a new chart and rendering it
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

 const exchangeSelector = document.querySelector('#select_cryptocurrency_01')
    if (exchangeSelector) {
        //This method call load the select dropdown
        loadSelect(exchangeSelector);
        exchangeSelector.onchange = function () {
            const symbolSelector = document.querySelector("#select_cryptocurrency_01");
            // symbolSelector.value = symbol;
            // This call initiates a connection to a websocket
            onChangeCurrency(symbolSelector.value);
        }
        if (socket === undefined) {
            socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
            socket.onopen = openWebSocket;
        }
    }


});

function loadCandleChartData(jsonObjects, records, line) {
    //Since we are loading the chart with new data, we
    // have to clear out any existing records
    if (records) {
        records.length = 0;
    }
    if (line){
        line.length = 0;
    }
    jsonObjects.forEach((entry, index) => {
        console.log(entry);
        let record = [];
        if (index % 50 === 0) {
            console.log(index % 50);
            let i = {x: (new Date(entry[0])), y: entry[4]};
            line.push(i);
        }
        record.push(entry[1]);
        //High
        record.push(entry[2]);
        //Low price
        record.push(entry[3]);
        //Closing price
        record.push(entry[4]);

        let j = {x: (new Date(entry[0])), y: record};
        records.push(j);

});
}

function openWebSocket() {
    // This function is called when a websocket connection is
    // opened
    // Here we are subscribing to sever messages on the open
    // web socket
    const subscribe = subscribeToWebSocket(symbol);
    socket.send(subscribe);
    // Here we listen for incoming messages
    // from the websocket and process them
    socket.addEventListener('message', (event) => {

        console.log('Message from server ', event.data);
        currentAsk = document.querySelector('#current_ask_01');
        currentBid = document.querySelector('#current_bid_01');

        const message = JSON.parse(event.data);

        // Kline messages come in a slow rate
        // so we can update the chart when the message
        // arrives without a performance hit
        if (message.e === 'kline') {
            recordOrder(message);
            let updateRecord = [];
            if (records.length % 50 === 0) {
                console.log(records.length % 50);
                let i = {x: (new Date(message.E)), y: message.k.c};

                line.push(i);
            }
            updateRecord.push(message.k.o);
            //High
            updateRecord.push(message.k.h);
            //Low price
            updateRecord.push(message.k.l);
            //Closing price
            updateRecord.push(message.k.c);

            let j = {x: (new Date(message.E)), y: updateRecord};
            console.log(j);
            records.push(j);
            records.shift();

            updateStatistics(records);

            let chartDiv = document.querySelector("#chart");

            if (chartDiv) {
                chart.updateSeries([{
                    name: 'line',
                    type: 'line',
                    data: line
                }, {
                    name: 'candle',
                    type: 'candlestick',
                    data: records
                }]);
            }

        }
        // if the message meets the format for an order
        // book message, then we update the order book
        // information
        if (message.u !== undefined) {
            processOrderBook(message);
        }
    });

}

function getCandleRecords(symbol) {

    let candle_records = undefined;
    console.log(`candle/${symbol}`);

    fetch(`candle/${symbol}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response);
        })
        .then(entry => {

            console.log(entry);
            candle_records = entry.candles;
            loadCandleChartData(candle_records, records, line);
        });
}
function recordOrder(order){
      /*
    This method records the incoming order message to save for later analysis
     */

    fetch(`/addorder`, {
        method: 'POST',
        body: JSON.stringify({
            content: order
        })
    })
        .then((response) => {
            // 1. check response.ok
            if (response.ok) {
                return response.json();
            }
            // 2. reject instead of throw
            return Promise.reject(response);
        })
        .catch((response) => {

        });
}
function loadSelect(selectObj) {
    // This function loads the select control with product data
    // received from a call to the Django backend
    fetch(`products`)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response);
        })
        .then(products => {
            //add products to drop down
            console.log(products);
            //reset the drop list given we have a server response
            selectObj.innerHTML = "";

            for (let key in products) {
                let option = document.createElement('option');
                option.setAttribute('value', products[key]);
                option.innerHTML = key;
                selectObj.append(option);
            }

        });
}

function onChangeCurrency(symbolSelected) {
    console.log(`Currency value changed to ${symbolSelected}`)

    if (socket.readyState === 1) {
        unsubscribeWebSocket(symbol);
        // Set symbol at the global level
        symbol = symbolSelected;
        socket.close();

    }

    getCandleRecords(symbolSelected);
    // We load the charts with initial data
    //loadCandleChartData(jsonObjects, records, line);
    symbol = symbolSelected
    socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
    //Update current data statics
    socket.onopen = openWebSocket;
}

function updateStatistics(records) {

    //This method calculates statistic to the array of values on the screen.
    statsArr = [];

    records.forEach((entry) => {
        statsArr.push(parseFloat(entry.y[0]));
    })
    let variance = findVariance(statsArr);
    //Finding the average of the array
    let average = statsArr.reduce((a, b) => a + b, 0) / statsArr.length;
    //Finding the standard deviation
    const standardDeviation = (arr, usePopulation = false) => {
        return Math.sqrt(
            arr.reduce((acc, val) => acc.concat((val - average) ** 2), []).reduce((acc, val) => acc + val, 0) /
            (arr.length - (usePopulation ? 0 : 1))
        );
    };
    let standardDev = standardDeviation(statsArr, true);

    averageDiv = document.querySelector('#recent_average');
    averageDiv.innerHTML = `Mean ${average.toFixed(3)}`;

    varianceDiv = document.querySelector('#current_variance')
    varianceDiv.innerHTML = `Variance ${variance.toFixed(3)}`

    standardDeviationDiv = document.querySelector('#current_standard_deviation');
    standardDeviationDiv.innerHTML = `Standard Deviation ${standardDev.toFixed(3)}`;


}

function processOrderBook(orderBookRow) {
    // This function processes the order book row for both bid and ask values
    let tempRowBid = {s: orderBookRow.s, b: parseFloat(orderBookRow.b), B: parseFloat(orderBookRow.B)};
    if (tempRowBid.s !== undefined) {
        currentBid.innerHTML = `Current Bid <strong>${orderBookRow.b}, ${orderBookRow.B} </strong>`;
        bidOrders.push(tempRowBid);
    }

    let tempRowAsk = {s: orderBookRow.s, a: parseFloat(orderBookRow.a), A: parseFloat(orderBookRow.A)};
    if (tempRowAsk.s !== undefined) {
        currentAsk.innerHTML = `Current Ask <strong>${orderBookRow.a}, ${orderBookRow.A}</strong>`;
        askOrders.push(tempRowAsk);
    }


    // Sort the array
    bidOrders.sort((a, b) => b.b - a.b);
    askOrders.sort((a, b) => b.a - a.a);

    askOrders = askOrders.filter(function (value) {
        return value !== undefined;
    });
    bidOrders = bidOrders.filter(function (value) {
        return value !== undefined;
    });

    //Truncate the length of the array
    if (bidOrders.length > 10) {
        bidOrders.length = 10;
    }
    if (askOrders.length > 10) {
        askOrders.length = 10;
    }
    renderAskOrderRow(askOrders);
    renderBidOrderRow(bidOrders);
}

const findVariance = (recordsArray = []) => {

    // This function calculates the variance found in the chart
    // data
    if (!recordsArray.length) {
        return 0;
    }
    // Sum all the values in the array
    const sum = recordsArray.reduce((acc, val) => acc + val);
    const {length: num} = recordsArray;
    const median = sum / num;
    let variance = 0;
    recordsArray.forEach(num => {
        variance += ((num - median) * (num - median));
    });
    variance /= num;
    return variance;
};

function populateTable(jsonData) {
    //Populate data in 24 hour ticker table
    ticker_table = document.querySelector('#table_body_01');
    //Check if table is in the document
    if (ticker_table) {
        const keys = Object.keys(jsonData);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            const tableRow = document.createElement('tr');
            const tableColKey = document.createElement('td');
            const tableColData = document.createElement('td');
            tableColKey.innerHTML = splitOnCapitals(key);
            tableColData.innerHTML = jsonData[key];
            tableRow.append(tableColKey, tableColData);
            ticker_table.append(tableRow)

        }
    }
}


function renderBidOrderRow(bidOrders) {

    bidTableBody = document.querySelector('#bid_table_body_01');
    bidTableBody.innerHTML = "";

    bidOrders.forEach((entry, index) => {
        if (entry.s) {

            const tableRow = document.createElement('tr');
            tableRow.setAttribute("class", "new_row_fade_01")
            const tableRowSymbol = document.createElement('td');
            const tableColKey = document.createElement('td');
            const tableColData = document.createElement('td');


            tableRowSymbol.innerHTML = entry.s;
            tableColKey.innerHTML = entry.b;
            tableColData.innerHTML = entry.B;
            tableRow.append(tableRowSymbol, tableColKey, tableColData);
            bidTableBody.append(tableRow)
        }

    });
}

function renderAskOrderRow(askOrders) {
    askTableBody = document.querySelector('#ask_table_body_01');
    askTableBody.innerHTML = "";
    askOrders.forEach((entry, index) => {
        if (entry.s) {

            const tableRow = document.createElement('tr');
            tableRow.setAttribute("class", "new_row_fade_02")
            const tableRowSymbol = document.createElement('td');
            const tableColKey = document.createElement('td');
            const tableColData = document.createElement('td');

            tableRowSymbol.innerHTML = entry.s;
            tableColKey.innerHTML = entry.a;
            tableColData.innerHTML = entry.A;
            tableRow.append(tableRowSymbol, tableColKey, tableColData);
            askTableBody.append(tableRow)
        }

    });
}

function unsubscribeWebSocket(symbol, interval = '1m') {
    return JSON.stringify({
        "method": "UNSUBSCRIBE",
        "params":
            [
                `${symbol.toLowerCase()}@miniTicker`,
                `${symbol.toLowerCase()}@bookTicker`,
                `${symbol.toLowerCase()}@aggTrade`,
                `${symbol.toLowerCase()}@kline_${interval}`,
            ],
        "id": 1
    });
}


function subscribeToWebSocket(symbol, interval = '1m') {
    return JSON.stringify(// Request
        {
            "method": "SUBSCRIBE",
            "params": [
                `${symbol.toLowerCase()}@miniTicker`,
                `${symbol.toLowerCase()}@bookTicker`,
                `${symbol.toLowerCase()}@aggTrade`,
                `${symbol.toLowerCase()}@kline_${interval}`,

            ],
            "id": 1
        }
    );
}

function splitOnCapitals(newString) {
    // This function breaks strings, adds spaces, and coverts text to upper case
    let lowerCase = newString.toLowerCase();
    // Add the character " " in front of that uppercase letter
    let result = "";
    for (var i = 0; i < newString.length; i++) {
        if (newString[i] !== lowerCase[i]) {
            result = result + " " + newString[i];
        } else {
            result = result + lowerCase[i];
        }
    }

    return result.toUpperCase();
}

function configureChart(line, chart) {

    let options = {
        series: [{
            name: 'line',
            type: 'line',
            data: line
        }, {
            name: 'candle',
            type: 'candlestick',
            data: records
        }],
        chart: {
            height: 350,
            type: 'line',
        },
        title: {
            text: 'CandleStick Chart',
            align: 'left'
        },
        stroke: {
            width: [3, 1]
        },
        tooltip: {
            shared: true,
            custom: [function ({seriesIndex, dataPointIndex, w}) {
                return w.globals.series[seriesIndex][dataPointIndex]
            }, function ({seriesIndex, dataPointIndex, w}) {
                var o = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
                var h = w.globals.seriesCandleH[seriesIndex][dataPointIndex]
                var l = w.globals.seriesCandleL[seriesIndex][dataPointIndex]
                var c = w.globals.seriesCandleC[seriesIndex][dataPointIndex]
                return (
                    ''
                )
            }]
        },
        xaxis: {
            type: 'datetime'
        }
    };
    return options;
}






