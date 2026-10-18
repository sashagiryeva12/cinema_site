from django.db import models
from django.contrib.auth.models import User
class Profile(models.Model):
    ROLE_CHOICES = [
        ("viewer", "Зритель"),
        ("admin", "Администратор"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="viewer",
    )

    def __str__(self):
        return f"{self.user.username} — {self.get_role_display()}"

class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    genre = models.CharField(max_length=100)
    duration = models.PositiveIntegerField()
    age_rating = models.CharField(max_length=10, default="12+")
    poster_url = models.URLField(blank=True)
    release_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


class CinemaHall(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    total_seats = models.PositiveIntegerField(default=50)

    def __str__(self):
        return self.name


class Session(models.Model):
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    hall = models.ForeignKey(
        CinemaHall,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    starts_at = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.movie.title} — {self.starts_at}"


class Booking(models.Model):
    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    seats = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Бронь #{self.id}"