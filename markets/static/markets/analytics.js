let socket = undefined;
let data = [0];
let chart = undefined;
let rollingAvg = [0];

document.addEventListener('DOMContentLoaded', function () {

    chart = new ApexCharts(document.querySelector("#chart"), initializeChart());
    chart.render();

    document.querySelector('#btn_start_charting_01').addEventListener('click', function () {
        socket = new WebSocket("wss://ws-feed.exchange.coinbase.com");
        socket.onopen = openWebSocket;
    });


    document.querySelector('#btn_stop_charting_01').addEventListener('click', function () {
        socket.close();
    });

});


function openWebSocket() {

    socket.addEventListener('message', (event) => {

        if (data.length > 50) {
            data.shift();
        }
        if (rollingAvg.length > 100) {
            rollingAvg.shift();
        }
        const eventData = JSON.parse(event.data);
        if (eventData.type && eventData.type === "l2update") {
            if (eventData.product_id && eventData.product_id === "ETH-USD") {
                if (eventData.changes && eventData.changes.length === 1) {
                    if (eventData.changes[0][0] && eventData.changes[0][0] === 'buy') {

                        data.push(eventData.changes[0][1]);
                        rollingAvg.push(Number(eventData.changes[0][1]));

                        document.querySelector("#div_buy_price_01").innerHTML = eventData.changes[0][1];
                        const avg = rollingAvg.reduce((a, b) => a + b) / rollingAvg.length

                        document.querySelector("#div_rolling_avg_01").innerHTML = avg.toFixed((2));

                        chart.updateOptions({
                            yaxis: {
                                min: (avg - 50),
                                max: (avg + 50)
                            }
                        });

                    }
                }

            }

        }

        chart.updateSeries([{
            data: data
        }])
    });
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
}

function initializeChart() {
    const options = {
        series: [{
            data: data.slice()
        }],
        chart: {
            id: 'realtime',
            height: 350,
            type: 'line',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        title: {
            text: 'Market Updating Chart',
            align: 'center'
        },
        markers: {
            size: 0
        },
        yaxis: {
            max: 100
        },
        legend: {
            show: false
        },
    };

    return options;
}
