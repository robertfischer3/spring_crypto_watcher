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

class Index(View):
    def get(self, request):

        api_url = "https://api.exchange.coinbase.com"
        sym = "BTC-USD"
        barsize = "300"
        timeEnd = datetime.now()
        delta = timedelta(minutes=5)
        timeStart = timeEnd - (300*delta)

        timeStart = timeStart.isoformat()
        timeEnd = timeEnd.isoformat()

        parameters={"start": timeStart, "end": timeEnd, "granularity":barsize}

        data = requests.get(f"{api_url}/products/{sym}/candles",
                            params=parameters,
                            headers={"content-type":"application/json"})

        context = {
            'results': data.json()
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