import hmac
import os
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, Http404, HttpResponseNotFound, HttpResponse
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from django.db import IntegrityError
from markets.models import User
from django.views import View
import requests
from datetime import datetime, timedelta, time
import json, hmac, hashlib, time, requests, base64
import pandas as pd
import json

BINANCE_URL = 'https://api.binance.us'
url_stuff = 'https://api.binance.us/api/v3/klines?symbol=ETHUSD&interval=1m'
BINANCE_EXCH_INFO_URL = "https://api.binance.us/api/v3/exchangeInfo"

class Index(View):
    def get(self, request):
        symbol = "BTCUSD"
        candle_data = requests.get(f"{BINANCE_URL}/api/v3/klines?symbol={symbol}&interval=1m")

        ticker = requests.get(f"{BINANCE_URL}/api/v3/ticker/24hr?symbol={symbol}")

        context = {
            'results': candle_data.json(),
            'ticker': ticker.json()
        }

        return render(request, 'markets/index.html', context)

    def post(self, request):
        pass

class Analytics(View):
    def get(self, request):
        context = {
            'count': 'Hello Analytics'
        }
        return render(request, 'markets/analytics.html', context)


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