
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

    def validate_seats(self, seats):
        if not isinstance(seats, list) or not seats:
            raise serializers.ValidationError(
                "Выбери хотя бы одно место."
            )

        if any(
            not isinstance(seat, int) or isinstance(seat, bool)
            for seat in seats
        ):
            raise serializers.ValidationError(
                "Номера мест должны быть целыми числами."
            )

        if any(seat < 1 for seat in seats):
            raise serializers.ValidationError(
                "Номер места должен быть положительным."
            )

        if len(seats) != len(set(seats)):
            raise serializers.ValidationError(
                "Одно и то же место нельзя выбрать дважды."
            )

        return seats

    def validate(self, attrs):
        session = attrs.get("session")
        seats = attrs.get("seats", [])

        if session and seats:
            if any(seat > session.hall.total_seats for seat in seats):
                raise serializers.ValidationError({
                    "seats": "В выбранном зале нет места с таким номером."
                })

            bookings = Booking.objects.filter(session=session)

            # При редактировании брони не сравниваем её с самой собой.
            if self.instance:
                bookings = bookings.exclude(pk=self.instance.pk)

            occupied_seats = set()

            for booking in bookings:
                occupied_seats.update(booking.seats)

            conflicts = occupied_seats.intersection(seats)

            if conflicts:
                raise serializers.ValidationError({
                    "seats": (
                        "Эти места уже заняты: "
                        + ", ".join(map(str, sorted(conflicts)))
                    )
                })

        return attrs

    def create(self, validated_data):
        return Booking.objects.create(**validated_data)