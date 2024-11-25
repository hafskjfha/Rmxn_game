from django.db import models

# Create your models here.
class Product(models.Model):
    word = models.CharField(max_length=100)
    description = models.TextField()
    theme = models.IntegerField()

    def __str__(self):
        return self.word