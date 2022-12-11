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
`index.html` displays a realtime candle data feed and order book information from the Binance API (https://api.binance.us)

### Getting Started
Getting started is fairly simple.  One of the main reasons for the choice of the Binance API is that
the services can be used without requiring a Binance API account. Originally, the Coinbase API (coinbase.com) was selected. However
the 

`pip install django`

`python manage.py makemigrations`

`python manage.py migrate`


`pip install requests`

`pip install pandas`

## Files Create for the application
In addition to the default files created by Django when running
`django-admin startproject spring_crypto_watcher`. The following files were created or modifies by the developer
to enable the project
### Python Files
#### views.py
Views (views.py) forms the core switchboard for multiple services.  The first is three are application views
`Index(View)`, `Analytics(View)`, and `Candle(View)`.
##### Index(View)
`Index(View)` allows the user to watch a particular cryptocurrency by selecting from a drop-down at the top of the page. 
The drop-down is pulled from the Binance APIs (https://api.binance.us). In addition, the page conncets to a websocket. 
The websocket is opened and subscribes to multiple feeds.  This can be seen in the following code. 
``` python

```
##### Analytics(View)
##### Candle(View)


#### urls.py
#### models.py 
#### japanesecandles.py
### HTML Files
The templates/markets directory contains the following:
#### analytics.html
#### candle.html
#### index.html
#### layout.html 
#### login.html
#### register.html


