from django.shortcuts import render

from collections import defaultdict
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes

from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.response import Response



from .models import Movie, CinemaHall, Session, Booking
from .serializers import (
    RegisterSerializer,
    MovieSerializer,
    CinemaHallSerializer,
    SessionSerializer,
    BookingSerializer,
    UserSerializer
)

from .permissions import IsAdminOrReadOnly


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by("id")
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]


class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHall.objects.all().order_by("id")
    serializer_class = CinemaHallSerializer


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related(
        "movie", "hall"
    ).order_by("starts_at")

    serializer_class = SessionSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(
        detail=True,
        methods=["get"],
        url_path="occupied-seats",
    )
    def occupied_seats(self, request, pk=None):
        session = self.get_object()

        bookings = Booking.objects.filter(
            session=session
        ).values_list("seats", flat=True)

        occupied = sorted({
            seat
            for seats in bookings
            for seat in seats
        })

        return Response({
            "session_id": session.id,
            "occupied_seats": occupied,
            "total_seats": session.hall.total_seats,
        })

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related("session", "session__movie")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.decorators import api_view, permission_classes


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_statistics(request):
    # Проверяем роль администратора.
    profile = getattr(request.user, "profile", None)

    if not request.user.is_superuser and (
        profile is None or profile.role != "admin"
    ):
        return Response(
            {"detail": "Доступ разрешён только администраторам."},
            status=status.HTTP_403_FORBIDDEN,
        )

    now = timezone.now()
    today = timezone.localdate()
    first_day = today - timedelta(days=6)

    # 1. Продажи билетов по фильмам за всё время.
    movie_stats = defaultdict(int)

    bookings = Booking.objects.select_related(
        "session", "session__movie"
    ).all()

    for booking in bookings:
        ticket_count = len(booking.seats or [])
        movie_stats[booking.session.movie.title] += ticket_count

    tickets_by_movie = [
        {"name": title, "tickets": count}
        for title, count in sorted(
            movie_stats.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    # 2. Расчётная стоимость бронирований по дням за последние 7 дней.
    daily_revenue = defaultdict(lambda: Decimal("0.00"))

    recent_bookings = bookings.filter(
        created_at__date__gte=first_day,
        created_at__date__lte=today,
    )

    for booking in recent_bookings:
        day = timezone.localtime(booking.created_at).date().isoformat()
        ticket_count = len(booking.seats or [])
        daily_revenue[day] += booking.session.price * ticket_count

    revenue_by_day = []

    for offset in range(7):
        day = first_day + timedelta(days=offset)
        day_key = day.isoformat()

        revenue_by_day.append({
            "date": day.strftime("%d.%m"),
            "revenue": float(daily_revenue[day_key]),
        })

    # 3. Занятые и свободные места по всем сеансам.
    total_seats = 0
    occupied_seats = 0

    sessions = Session.objects.select_related("hall").all()

    for session in sessions:
        total_seats += session.hall.total_seats

        session_bookings = Booking.objects.filter(
            session=session
        ).values_list("seats", flat=True)

        occupied = {
            seat
            for seats in session_bookings
            for seat in (seats or [])
        }

        occupied_seats += len(occupied)

    free_seats = max(total_seats - occupied_seats, 0)

    return Response({
        "tickets_by_movie": tickets_by_movie,
        "revenue_by_day": revenue_by_day,
        "seat_occupancy": [
            {"name": "Занятые места", "value": occupied_seats},
            {"name": "Свободные места", "value": free_seats},
        ],
    })