from django.urls import path
from . import views
from .views import Index
from .views import Analytics
from .views import CandleView

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
