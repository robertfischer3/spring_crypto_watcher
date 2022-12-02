let socket = undefined;

let data = [0];

const WEBSOCKET_URL = "wss://ws-feed.exchange.coinbase.com";

document.addEventListener('DOMContentLoaded', function () {

    const results = document.querySelector('#results').textContent;

    const jsonObjects = JSON.parse(results);
    console.log(jsonObjects[0]);

    const records = [];
    const line = [];

    //jsonObjects.forEach((timeEntry)=>{time.push(new Date(timeEntry[0]));});

    jsonObjects.forEach((entry, index)=>{
        let record = [];
        if (index % 30 === 0)
        {
            console.log(index % 30);
            let i = {x: (new Date(entry[0])), y: entry[4] };
            line.push(i);
        }
        record.push(entry[3]);
        record.push(entry[1]);
        record.push(entry[2]);
        record.push(entry[4]);
        let j = {x: (new Date(entry[0])), y: record };
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
          custom: [function({seriesIndex, dataPointIndex, w}) {
            return w.globals.series[seriesIndex][dataPointIndex]
          }, function({ seriesIndex, dataPointIndex, w }) {
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

    socket = new WebSocket(WEBSOCKET_URL);
    socket.onopen = openWebSocket;

});

function openWebSocket() {

    socket.send(sendTickerBatchChannel("ETH-USD"));
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
    });

}

function sendTickerBatchChannel(product) {
    return JSON.stringify(// Request
        {
            "type": "subscribe",
            "product_ids": [
                product,
            ],
            "channels": ["ticker_batch"]
        });
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




