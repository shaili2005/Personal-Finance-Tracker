from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('grocery', 'Grocery'),
        ('salary', 'Salary'),
        ('entertainment', 'Entertainment'),
        ('bills', 'Bills'),
        ('others', 'Others'),
    ]

    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    description = models.CharField(max_length=255)
    amount = models.FloatField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='others')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.description} ({self.type}) - {self.amount}"