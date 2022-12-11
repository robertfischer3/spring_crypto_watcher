let socket;
let data = [];
let chart;
let rollingAvg=[];

let symbol = "BTCUSD";

// Web Socket Address
let WEBSOCKET_URL = 'wss://stream.binance.us:9443/ws';

document.addEventListener('DOMContentLoaded', function () {

    // Create real-time chart to track moving price data
    chart = new ApexCharts(document.querySelector("#chart"), initializeChart());
    chart.render();

    const exchangeSelector = document.querySelector('#select_cryptocurrency_01');
    // Load currency selector list
    if (exchangeSelector) {
        //This method call load the select dropdown
        loadSelect(exchangeSelector);
        exchangeSelector.onchange = function () {
            const symbolSelector = document.querySelector("#select_cryptocurrency_01");
            // symbolSelector.value = symbol;
            // This call initiates a connection to a websocket
            onChangeCurrency(symbolSelector.value);
        };
        // If a socket hasn't been opened, open one.
        if (socket === undefined) {
            socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@ticker`);
            socket.onopen = openWebSocket;
        }
    }

});

function openWebSocket() {
// This method handles the websocket open event

    // Here we are subscribing to sever messages on the open
    // web socket
    const subscribe = subscribeToWebSocket(symbol);
    socket.send(subscribe);

    // Add an event listener to listen for socket events
    socket.addEventListener('message', (event) => {
        //Grab feed data and convert to JSON
        const changes = JSON.parse(event.data);
        if (data.length >= 25) {
            data.shift();
        }
        if (rollingAvg.length >= 10) {
            rollingAvg.shift();
        }
        if (changes.c !==undefined){
            data.push([changes.E, changes.c]);
        }

        //Calculating a rolling average
        rollingAvg.push(Number(changes.c));

        document.querySelector("#div_buy_price_01").innerHTML = Number(changes.c).toFixed(2);
        // Updating the feed information on the page from streaming data
        document.querySelector("#event_type").innerHTML = changes.e;
        document.querySelector("#event_time").innerHTML = new Date(changes.E).toLocaleTimeString();
        document.querySelector("#symbol").innerHTML = changes.s;
        document.querySelector("#price_change").innerHTML = changes.p;
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
        document.querySelector("#statistics_open_time").innerHTML = new Date(changes.O).toLocaleTimeString();
        document.querySelector("#statistics_close_time").innerHTML = new Date(changes.C).toLocaleTimeString();
        document.querySelector("#total_number_of_trades").innerHTML = changes.n;

        const avg = rollingAvg.reduce((a, b) => a + b) / rollingAvg.length;

        if (isNaN(avg)){
             document.querySelector("#div_rolling_avg_01").innerHTML = "Calculating...";
        }
        else {
            document.querySelector("#div_rolling_avg_01").innerHTML = avg.toFixed((2));
        }
        const chart_resolution = Math.abs(Number(changes.p));
        // The following sets the chart resolution based on recent price changes
        chart.updateOptions({
                                yaxis: {
                                    min: (Number(changes.c) - chart_resolution),
                                    max: (Number(changes.c) + chart_resolution)
                                }
                            });

        // Updates the series data that forms the chart line
        chart.updateSeries([{
            data: data
        }]);
    });

}

function onChangeCurrency(symbolSelected) {
    if (socket.readyState === 1) {
        unsubscribeWebSocket(symbol);
        // Set symbol at the global level
        socket.close();
    }
    symbol = symbolSelected;
    // Clear chart information
    data.length = 0
    chart.updateSeries([{
            data: data
        }]);
    //Open new websocket for updated symbol query
    socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
    // Handle to websocket open event
    socket.onopen = openWebSocket;
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
        xaxis: {
          type: 'datetime',
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



