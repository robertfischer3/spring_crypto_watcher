let socket;
let data = [0];
let chart;
let rollingAvg=[0];
let symbol = "BTCUSD";

// Web Socket Address
let WEBSOCKET_URL = 'wss://stream.binance.us:9443/ws';

document.addEventListener('DOMContentLoaded', function () {

    chart = new ApexCharts(document.querySelector("#chart"), initializeChart());
    chart.render();

    const exchangeSelector = document.querySelector('#select_cryptocurrency_01');

    if (exchangeSelector) {
        //This method call load the select dropdown
        loadSelect(exchangeSelector);
        exchangeSelector.onchange = function () {
            const symbolSelector = document.querySelector("#select_cryptocurrency_01");
            // symbolSelector.value = symbol;
            // This call initiates a connection to a websocket
            onChangeCurrency(symbolSelector.value);
        };
        if (socket === undefined) {
            socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@ticker`);
            socket.onopen = openWebSocket;
        }
    }

});


function openWebSocket() {

    // Here we are subscribing to sever messages on the open
    // web socket
    const subscribe = subscribeToWebSocket(symbol);
    socket.send(subscribe);

    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
        changes = JSON.parse(event.data);
        if (data.length > 50) {
            data.shift();
        }
        if (rollingAvg.length > 10) {
            rollingAvg.shift();
        }
        data.push(changes.c);
        rollingAvg.push(Number(changes.c));

        document.querySelector("#div_buy_price_01").innerHTML = changes.c;

        document.querySelector("#event_type").innerHTML = changes.e;
        document.querySelector("#event_time").innerHTML = changes.E;
        document.querySelector("#symbol").innerHTML = changes.s;
        document.querySelector("#price_change").innerHTML = changes.p
        document.querySelector("#price_change_percent").innerHTML = changes.P;
        document.querySelector("#weighted_average_price").innerHTML = changes.w;
        document.querySelector("#first_trade").innerHTML = changes.x;
        document.querySelector("#last_price").innerHTML = changes.c;
        document.querySelector("#last_quantity").innerHTML = changes.Q;
        document.querySelector("#best_bid_price").innerHTML = changes.b;
        document.querySelector("#best_bid_quatity").innerHTML = changes.B;
        document.querySelector("#best_ask_price").innerHTML = changes.a;
        document.querySelector("#best_ask_quantity").innerHTML = changes.A;
        document.querySelector("#open_price").innerHTML = changes.o;
        document.querySelector("#high_price").innerHTML = changes.h;
        document.querySelector("#low_price").innerHTML = changes.l;
        document.querySelector("#total_base_asset_volume").innerHTML = changes.v;
        document.querySelector("#total_traded_quote_asset_volume").innerHTML = changes.q;
        document.querySelector("#statistics_open_time").innerHTML = changes.O;
        document.querySelector("#statistics_close_time").innerHTML = changes.C;
        document.querySelector("#total_number_of_trades").innerHTML = changes.n;

        const avg = rollingAvg.reduce((a, b) => a + b) / rollingAvg.length;

        document.querySelector("#div_rolling_avg_01").innerHTML = avg.toFixed((2));

        chart.updateSeries([{
            data: data
        }])
    });

}

function onChangeCurrency(symbolSelected) {
    if (socket.readyState === 1) {
        unsubscribeWebSocket(symbol);
        // Set symbol at the global level
        socket.close();
    }
    symbol = symbolSelected;
    document.querySelector("span").innerHTML;
}

function unsubscribeWebSocket(symbol) {
    //This method is used to gracefully disconnect a websocket
    return JSON.stringify({
        "method": "UNSUBSCRIBE",
        "params":
            [
                `${symbol.toLowerCase()}@ticker`,
            ],
        "id": 1
    });
}



function subscribeToWebSocket(symbol) {
    // This method is used to connect to a websocket and subscribe
    // to various feeds on a single web socket connect
    return JSON.stringify(// Request
        {
            "method": "SUBSCRIBE",
            "params": [
                `${symbol.toLowerCase()}@ticker`,
            ],
            "id": 1
        }
    );
}

function loadSelect(selectObj) {
    // This function loads the select control with product data
    // received from a call to the Django backend
    fetch(`products`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(products => {
            //add products to drop down
            console.log(products);
            //reset the drop list given we have a server response
            selectObj.innerHTML = "";

            // Populate the option values for the drop-down
            for (let key in products) {
                let option = document.createElement('option');
                option.setAttribute('value', products[key]);
                option.innerHTML = key;
                selectObj.append(option);
            }

        });
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

        title: {
            text: 'Market Updating Chart',
            align: 'center'
        },
        markers: {
            size: 0
        },
        yaxis: {
            max: 20000
        },
        legend: {
            show: false
        },
    };

    return options;
}



