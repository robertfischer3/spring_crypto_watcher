# Spring Crypto Watcher

The Django app, Spring Crypto Watcher makes use of Binance API rest services and websockets to

This README.MD describes the Spring Crypto Watcher Final Project. 
The project consists of these main areas:
- Python (Django) backend
- HTML templates
- Javascript files
- Binance API (https://api.binance.us)

The main goal of the project was to use websockets to obtain real-time cryptocurrency market data. Another significant goal
was the saving of real-time websocket streaming data to a database backend for later analysis.  Of the three main application pages, 
`index.html` displays a realtime candle data feed and order book information from the Binance API (https://api.binance.us). 
`analytics.html` displays real-time 24 hour ticker data and `candle.html` provides for the retrieval of 
saved candle data streams and analyzes the data for recognizable candle chart patterns.

### Websocket Design
The focus of this application is the use of websockets for real-time data feeds. Originally the project design included the use of 
Django channels which can create websockets.  However, there was no data that needed to be streamed
from Django. Websockets are , in general are designed to open a connection once and stay open with a client application.  In this way, 
real-time applications are supportable because the expensive nature of connecting between two machines. Service connections
require setup and tear downtime for each new connection.  Websockets connect once and stay open with the client. 

In general, the spring_crypto_watcher creates a websocket connection from a javascript file since setting the Django portion of the application
would mean create asynchronous server side code, and employ Django channels for the mere purpose of rebroadcasting the websocket streaming for
the Binance API (https://api.binance.us). Setting up the Django asynchronous, websocket streaming from the Binance API only reduces 
performance and adds unnecessary complexity to an otherwise simple implementation. 

The following is an example of how simple it is to connect to a websocket using Javascript:
```javascript
        if (socket === undefined) {
            socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
            socket.onopen = openWebSocket;
        }
```

### Getting Started
Getting started is fairly simple.  One of the main reasons for the choice of the Binance API is that
the services can be used without requiring a Binance API account. Originally, the Coinbase API (coinbase.com) was selected. However
the Coinbase API required account registration. Binance offered a better, more straightforward approach to 
accessing web services and websockets with anonymous use. 

#### To Begin:
**Install Django, if not done already:**

`pip install django`

**Create the database and database model**

`python manage.py makemigrations`

`python manage.py migrate`

**Install these additional libraries**

`pip install requests`

`pip install pandas`

**Create a Django superuser (at minimum):**

Run `python manage.py createsuperuser`, input your email, password and username

## Files created for the application
In addition to the default files created by Django when running
`django-admin startproject spring_crypto_watcher`. The following files were created or modifies by the developer
to enable the project

### Python Files

#### views.py
Views (views.py) forms the core switchboard for multiple services.  The first is three are application views
`Index(View)`, `Analytics(View)`, and `Candle(View)`. In addition, there are several services that have been created that are called from Javascript clients. They are:
- get_candle_patterns(request, batch):
- get_ticker(request, symbol):
- def add_candle(request):
- get_candle_data(url, symbol, interval="1m"):
- get_products_sublist(request):

The above item are mostly used to retrieve information.  Some services could have been completely implemented on the client side.  However, placing 
these services on the server side allows for future processing changes. For example:

##### Index(View)
`Index(View)` class allows the user to watch a particular cryptocurrency by selecting from a drop-down at the top of the page. 
The drop-down is pulled from the Binance APIs (https://api.binance.us). In addition, the page connects to a websocket. 
The websocket is opened and subscribes to multiple feeds on the client side. Additionally, the page includes the ability for signed-in users
to save streaming candlestick data to a database. The page hosts a candlestick chart for the selected cryptocurrency as well as real-time 
order book of ask and buy actions in the market

##### Analytics(View)
`Analytics(View)` class allows users to watch 24 hour ticker data for a selected currency. The drop-down changes the streaming feed.
This page demonstrates the ability to track realtime data.  The chart on the page shows the last 50 data points receive
##### Candle(View)
The `Candle(View)` class allows user to reload saved candlestick price data and have it run through a simple candlestick pattern recognition set of 
algorithms.

#### urls.py
The `urls.py` code sets up the routing for pages and services that support the application.  As we can see in the files both view and 
services are provided. The services are generally designed to be used by Javascript code running on the client. 
```python
app_name = "markets"

urlpatterns = [
    path("", Index.as_view(), name="index"),
    path("analytics", Analytics.as_view(), name="analytics"),
    path("batchanalysis", CandleView.as_view(), name="batchanalysis"),
    path("products", views.get_products_sublist, name="products"),
    path("ticker/<str:symbol>", views.get_ticker, name="ticker"),
    path("patterns/<str:batch>", views.get_candle_patterns, name="patterns"),
    path("addorder", views.add_candle, name="addorder"),
    path("candle/<str:symbol>", views.get_initial_chart_data, name="candle"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]

```
Methods, such as `path("ticker/<str:symbol>", views.get_ticker, name="ticker")`, are utilized by the client side Javascript code.  
#### models.py 
#### japanesecandles.py
The `japanesecandles.py` file is simplified algorithms used for looking at candle data and determining if there are
recognizable patterns that code be used for automated trading. In production applications, a more robust library such as 
[TA Lib](https://pypi.org/project/TA-Lib/). The TA Lib library has sophisticated candlestick pattern recognition but relies on having 
Cython available.  The goal here was to avoid requiring a potentially complex implementation for the grader, so a simplified 
pattern recongnition library was developed in `japanesecandles.py` instead
### HTML Files
The templates/markets directory contains the following:
#### index.html
The index.html file is the default landing page for the application and displays websocket data in real-time
without reloading the page via websockets. The page displays 24 hour ticket data captured on the page load. To refresh 24hr 
ticker data requires a page refresh.  The price candle chart and order book information does not require a page refresh because they are connected
to real time streaming services at Binance.

**Note**
CSS Style code exists on the index.html page. This code was original located in `style.css`, but the animations failed to execute.
The decision to move the code into `index.html` is a temporary one until the bug is dicovered.
#### analytics.html
#### candle.html
#### layout.html 
#### login.html
#### register.html
### Javascript Files
#### index.js
The `index.js` file contains code to connect to a Binance API websocket instance and sets up subscriptions with the websocket to be able
to receive selected Binance market messages. The websocket setup code looks like this:
```javascript
        if (socket === undefined) {
            socket = new WebSocket(`${WEBSOCKET_URL}/${symbol}@bookTicker`);
            socket.onopen = openWebSocket;
        }
```
As seen above once the socket has been opened.  A call is made to the `openWebSocket` javascript function. The `openWebSocket`
function then subscribes to several Binance websocket feeds. Notice that exchange being followed is determined by an exchange symbol:
```javascript

function openWebSocket() {
    // This function is called when a websocket connection is
    // opened
    // Here we are subscribing to sever messages on the open
    // web socket
    const subscribe = subscribeToWebSocket(symbol);
    socket.send(subscribe);
    ...
    
    function subscribeToWebSocket(symbol, interval = '1m') {
    // This method is used to connect to a websocket and subscribe
    // to various feeds on a single web socket connect
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
    
```
**Candlestick data**
In the code above, the line `${symbol.toLowerCase()}@kline_${interval}` is displayed. In the cryptocurrency marketplace, candlestick data
and kline data often refer to the same data.  The two are often used interchangeably. The following in the payload delivered from the Binance API
```json
{
  "e": "kline",     // Event type
  "E": 123456789,   // Event time
  "s": "BNBBTC",    // Symbol
  "k": {
    "t": 123400000, // Kline start time
    "T": 123460000, // Kline close time
    "s": "BNBBTC",  // Symbol
    "i": "1m",      // Interval
    "f": 100,       // First trade ID
    "L": 200,       // Last trade ID
    "o": "0.0010",  // Open price
    "c": "0.0020",  // Close price
    "h": "0.0025",  // High price
    "l": "0.0015",  // Low price
    "v": "1000",    // Base asset volume
    "n": 100,       // Number of trades
    "x": false,     // Is this kline closed?
    "q": "1.0000",  // Quote asset volume
    "V": "500",     // Taker buy base asset volume
    "Q": "0.500",   // Taker buy quote asset volume
    "B": "123456"   // Ignore
  }
}
```

[Source (Binance)](https://docs.binance.us/?python#candlestick-data-stream)

#### analytics.js
The `analytics.js` code works in the same manner as the `index.js` code.  It, too, sets up a websocket connection and then subscribes to feeds
from Binance. This code demonstrates the streaming of real-time market data to be displayed on web page (analytics.html) without a page
refresh. The code in `analytics.js` in part updates a real-time 24-hour price chart and table with multiple 24 hour ticker trading data.
The main websocket message that is being subscribed is delivered the following json data:
```json
{
  "e": "24hrTicker",  // Event type
  "E": 123456789,     // Event time
  "s": "BNBBTC",      // Symbol
  "p": "0.0015",      // Price change
  "P": "250.00",      // Price change percent
  "w": "0.0018",      // Weighted average price
  "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
  "c": "0.0025",      // Last price
  "Q": "10",          // Last quantity
  "b": "0.0024",      // Best bid price
  "B": "10",          // Best bid quantity
  "a": "0.0026",      // Best ask price
  "A": "100",         // Best ask quantity
  "o": "0.0010",      // Open price
  "h": "0.0025",      // High price
  "l": "0.0010",      // Low price
  "v": "10000",       // Total traded base asset volume
  "q": "18",          // Total traded quote asset volume
  "O": 0,             // Statistics open time
  "C": 86400000,      // Statistics close time
  "F": 0,             // First trade ID
  "L": 18150,         // Last trade Id
  "n": 18151          // Total number of trades
}

```
[Source (Binance)](https://docs.binance.us/?python#ticker-24h-change-stream)

**Note**
The chart on the `analytics.html` requires code to focus the chart to a meaningful range. For example, 
BTCUSD (Bitcoin in USD ($)) was trading the $17K range. Without code to set a meaningful focus range
the chart can update in real time, looks like a flat line even changes in the displayed price data occur every second. As a result
the chart boundaries are focused at plus or minus five units around the last price.  In the event of a dramatic price change
the chart may not show the previous changes because the minimum and maximum y-axis boundaries are too narrow. However, normal 
trading activity is general kept in small ranges.  Hence 

#### candle.js
`candle.js` supports the activities on candle.html. `candle.js` goes and finds all candle streaming data batches and allows the user to select
a user created batch.  The following Javascript code in `candle.js` pulls forward the saved candlestick data from `views.py` method, and searches for candlestick

