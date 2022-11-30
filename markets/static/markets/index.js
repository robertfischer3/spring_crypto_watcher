let socket = undefined;

let data = [0];

const WEBSOCKET_URL = "wss://ws-feed.exchange.coinbase.com";

document.addEventListener('DOMContentLoaded', function () {
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