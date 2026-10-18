
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Profile,
    Movie,
    CinemaHall,
    Session,
    Booking,
)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, role="viewer")
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(
        source="profile.role",
        read_only=True,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = "__all__"


class CinemaHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = CinemaHall
        fields = "__all__"


class SessionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(
        source="movie.title",
        read_only=True,
    )
    hall_name = serializers.CharField(
        source="hall.name",
        read_only=True,
    )

    class Meta:
        model = Session
        fields = [
            "id",
            "movie",
            "movie_title",
            "hall",
            "hall_name",
            "starts_at",
            "price",
        ]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "session", "seats", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        return Booking.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )
