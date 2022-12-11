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
`Index(View)`, `Analytics(View)`, and `Candle(View)`. In addition, there several services that have been created that a called from the
by Javascript clients. They are:
- get_candle_patterns(request, batch):
- get_ticker(request, symbol):
- def add_candle(request):
- get_candle_data(url, symbol, interval="1m"):
- get_products_sublist(request):

##### Index(View)
`Index(View)` allows the user to watch a particular cryptocurrency by selecting from a drop-down at the top of the page. 
The drop-down is pulled from the Binance APIs (https://api.binance.us). In addition, the page connects to a websocket. 
The websocket is opened and subscribes to multiple feeds on the client side. Additionally, the page includes the ability for signed-in users
to save streaming candlestick data to a database. The page hosts a candlestick chart for the selected cryptocurrency as well as real-time 
order book of ask and buy actions in the market

##### Analytics(View)
`Analytics(View)` allows users to watch 24 hour ticker data for a selected currency. The drop-down changes the streaming feed.
This page demonstrates the ability to track realtime data.  The chart on the page shows the last 50 data points receive
##### Candle(View)


#### urls.py
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
ticker data requires a page refresh.  The price candle chart and order book information does not require a page refresh.  
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

```
#### analytics.js
#### candle.js


