let socket = undefined;
let data = [0];
let symbol = "ETHUSD";
let askOrders = [];
let bidOrders = [];

WEBSOCKET_URL = 'wss://stream.binance.us:9443/ws';

document.addEventListener('DOMContentLoaded', function () {

    const results = document.querySelector('#results').textContent;
    const ticker = document.querySelector('#ticker').textContent;

    const jsonObjects = JSON.parse(results);
    const jsonTicker = JSON.parse(ticker);

    populateTable(jsonTicker);

    const records = [];
    const line = [];

    jsonObjects.forEach((entry, index) => {
        let record = [];
        if (index % 30 === 0) {
            console.log(index % 30);
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


    var options = {
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

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();


    const exchangeSelector = document.querySelector('#select_cryptocurrency_01')

    socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
    socket.onopen = openWebSocket;

});

function populateTable(jsonData) {
    //Populate data in 24 hour ticker table
    ticker_table = document.querySelector('#table_body_01');
    //Check if table is in the document
    if (ticker_table) {
        const keys = Object.keys(jsonData);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            console.log(splitOnCapitals(key), jsonData[key]);

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

function openWebSocket() {

    socket.send(subscribeToWebSocket(symbol));
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
        orderBookRow = JSON.parse(event.data);
        let tempRowBid = {s: orderBookRow.s, b: parseFloat(orderBookRow.b), B: parseFloat(orderBookRow.B)};
        bidOrders.push(tempRowBid);
        let tempRowAsk = {s: orderBookRow.s, a: parseFloat(orderBookRow.a), A: parseFloat(orderBookRow.A)};
        askOrders.push(tempRowAsk);

        bidOrders.sort((a, b) => b.b - a.b);
        askOrders.sort((a, b) => b.b - a.b);

        if (bidOrders.length > 15){
            bidOrders.shift();
        }

    });

}

function unsubscribeWebSocket(symbol) {
    return JSON.stringify({
        "method": "UNSUBSCRIBE",
        "params": [
            `${symbol.toLowerCase()}@bookTicker`
        ],
        "id": 1
    });
}

function onChangeCurrency(symbol) {
    if (socket.readyState === 1) {
        unsubscribeWebSocket(symbol);
    }

}

function subscribeToWebSocket(symbol) {
    return JSON.stringify(// Request
        {
            "method": "SUBSCRIBE",
            "params": [
                `${symbol.toLowerCase()}@bookTicker`
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

const jsonText = `{
            "type": "subscribe",
            "product_ids": [
                "ETH-USD",
                "ETH-EUR"
            ],
            "channels": [
                "level2",
                "heartbeat",
                {
                    "name": "ticker",
                    "product_ids": [
                        "ETH-BTC",
                        "ETH-USD"
                    ]
                }
            ]
        }`;
socket.send(jsonText);




