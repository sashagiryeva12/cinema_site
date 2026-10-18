from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    MovieViewSet,
    CinemaHallViewSet,
    SessionViewSet,
    BookingViewSet,
     CurrentUserView
)

router = DefaultRouter()
router.register("movies", MovieViewSet)
router.register("halls", CinemaHallViewSet)
router.register("sessions", SessionViewSet)
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("", include(router.urls)),
]