from django.contrib.auth import authenticate, login, logout
from django.http import (
    HttpResponseRedirect,
    Http404,
    HttpResponseNotFound,
    HttpResponse,
)
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.db import IntegrityError
from markets.models import User
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Candle, Product
from markets.japanesecandles import find_japanese_patterns

import requests
import json

BINANCE_URL = "https://api.binance.us"
BINANCE_EXCH_INFO_URL = "https://api.binance.us/api/v3/exchangeInfo"


class Index(View):
    def get(self, request):
        symbol = "BTCUSD"
        candle_data = get_candle_data(BINANCE_URL, symbol=symbol, interval="1m")
        ticker = requests.get(f"{BINANCE_URL}/api/v3/ticker/24hr?symbol={symbol}")

        context = {"results": candle_data.json(), "ticker": ticker.json()}

        return render(request, "markets/index.html", context)

    def post(self, request):
        pass


class Analytics(View):
    def get(self, request):
        context = {}
        return render(request, "markets/analytics.html", context)


class CandleView(View):
    """
    CandleView displays selected saved data
    """

    def get(self, request):
        # Authenticated users view their saved candle data
        if request.user.is_authenticated:
            # Finding the unique batches found in the database
            user_batches = (
                Candle.objects.filter(user_id=request.user)
                .values_list("batch", flat=True)
                .distinct()
            )
            context = {"user_batches": user_batches}
            return render(request, "markets/candle.html", context=context)

        # Everyone else is prompted to sign in
        else:
            return HttpResponseRedirect(reverse("login"))


def get_candle_patterns(request, batch):
    """
    This method returns the row evaluations looking for candle patterns.
    :param request:
    :param batch:
    :return:
    """
    if request.method == "GET":
        candles = (
            Candle.objects.filter(batch=batch)
            .select_related()
            .values(
                "id",
                "open",
                "high",
                "low",
                "close",
                "volume",
                "created",
                "user__username",
                "product__exchange_id",
            )
        )
        df = find_japanese_patterns(candles)
        if df.shape[0] > 0:

            patterns = df.to_json(orient="records")
            return JsonResponse({"patterns": patterns})
        else:
            return JsonResponse(
                {
                    "error": "Candle patterns function find_japanese_patterns returned no records"
                }
            )


def get_ticker(request, symbol):
    """
    Retreiving 24 hour ticker data by symbol
    :param request:
    :param symbol:
    :return:
    """
    if request.method == "GET":
        ticker = requests.get(f"{BINANCE_URL}/api/v3/ticker/24hr?symbol={symbol}")
        ticker_dict = {"ticker": ticker.json()}
        return JsonResponse(ticker_dict)


def get_initial_chart_data(request, symbol):
    """
    Grabbing updated initial chart data to update a chart to new symbol
    :param request:
    :param symbol:
    :return:
    """
    if request.method == "GET":
        candle_data = get_candle_data(BINANCE_URL, symbol=symbol, interval="1m")
        candle_dict = {"candles": candle_data.json()}
        return JsonResponse(candle_dict)


@login_required
def add_candle(request):
    # Saving candle feed data to database back end
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check the request body for candle messages
    data = json.loads(request.body)
    if data:
        exchange_id = data["content"]["s"]
        title = data["content"]["s"]
        batch = data["content"]["batch_id"]
        open = float(data["content"]["k"]["o"])
        close = float(data["content"]["k"]["c"])
        high = float(data["content"]["k"]["h"])
        low = float(data["content"]["k"]["l"])
        volume = float(data["content"]["k"]["v"])
        # Here we check for an instance of the Crypto currency product in the Database
        try:
            product = Product.objects.get(exchange_id=exchange_id)
        except Product.DoesNotExist:
            Product.objects.create(title=title, exchange_id=exchange_id)
            product = Product.objects.get(exchange_id=exchange_id)
        # If the product exists in the database, a Candle datapoint can be added to the DB
        if product:
            Candle.objects.create(
                batch=batch,
                product_id=product.id,
                open=open,
                high=high,
                low=low,
                close=close,
                volume=volume,
                user_id=request.user.id,
            )
    # Send response back to application
    return JsonResponse({"message": "kline added successfully."}, status=201)


def get_candle_data(url, symbol, interval="1m"):
    # General function to pull candle information from Binance
    # This function could also been done on the client side with Javascript
    # However, addition statistical data modeling can process the data with
    # Python data science libraries which may be included in the future
    candle_data = requests.get(
        f"{url}/api/v3/klines?symbol={symbol}&interval={interval}"
    )

    return candle_data


def get_products_sublist(request):
    """
    This method pulls back the sub-list of products that the application supports
    and passing them onto the client. While this code could be pulled directly
    by JavaScript, the points to demonstrate addition backend capabilities where heavy
    processing might better occur on the server side.
    :param request:
    :return:
    """
    if request.method == "GET":
        exhang_info = requests.get(f"{BINANCE_URL}/api/v3/exchangeInfo")

        symbol_dict = {}

        exchange_content = json.loads(exhang_info.content)
        symbols = exchange_content.get("symbols")
        # Here we are only interested in a subset of products
        # Therefore we limit the number of records
        for symbol in symbols[0:13]:
            symbol_code = symbol.get("symbol")
            # Some of the currencies don't chart well. While the graph displays them correctly, the
            # appears to be in error, which it isn't. These were removed due to charting issues.
            if str(symbol_code).startswith("XRP") == False and "USDTUS" not in str(
                symbol_code
            ):
                symbol_dict[symbol_code] = symbol_code

        return JsonResponse(symbol_dict)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("markets:index"))
        else:
            return render(
                request,
                "markets/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "markets/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("markets:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "markets/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "markets/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("markets:index"))
    else:
        return render(request, "markets/register.html")
