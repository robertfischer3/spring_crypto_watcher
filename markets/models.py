from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
from django.utils import timezone


# Create your models here.
class User(AbstractUser):
    pass

class Product(models.Model):
    """
    Product model for providing exchange names to select from web service
    """
    title = models.CharField(max_length=255)
    exchange_id = models.CharField(max_length=50)
    created = models.DateTimeField(default=datetime.now)

    class Meta:
        verbose_name = "product"
        verbose_name_plural = "products"

    def __str__(self):
        return f"Product {self.title} on {self.created} with id {self.id}"


class Candle(models.Model):
    """
    Candle model for storing historical price information
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="products")
    open = models.FloatField(default=float(0))
    high = models.FloatField(default=float(0))
    low = models.FloatField(default=float(0))
    close = models.FloatField(default=float(0))
    volume = models.FloatField(default=float(0))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="users")
    batch = models.CharField(max_length=36, default="")
    created = models.DateTimeField(default=datetime.now)

    class Meta:
        verbose_name = "candle"
        verbose_name_plural = "candles"

    def __str__(self):
        return f"Candle gathered by report {self.report} on {self.created} with id {self.id}"
