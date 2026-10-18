from django.shortcuts import render

from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Movie, CinemaHall, Session, Booking
from .serializers import (
    RegisterSerializer,
    MovieSerializer,
    CinemaHallSerializer,
    SessionSerializer,
    BookingSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by("id")
    serializer_class = MovieSerializer


class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHall.objects.all().order_by("id")
    serializer_class = CinemaHallSerializer


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related(
        "movie", "hall"
    ).order_by("starts_at")
    serializer_class = SessionSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related("session", "session__movie")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)