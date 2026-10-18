from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from cinema.models import Movie, CinemaHall, Session


class Command(BaseCommand):
    help = "Добавляет демонстрационные фильмы, залы и сеансы"

    def handle(self, *args, **options):
        movies_data = [
            {
                "title": "Interstellar",
                "description": "Путешествие через космос в поисках нового дома.",
                "genre": "Фантастика",
                "duration": 169,
                "age_rating": "12+",
                "poster_url": "",
            },
            {
                "title": "Inception",
                "description": "Команда проникает в чужие сны.",
                "genre": "Триллер",
                "duration": 148,
                "age_rating": "12+",
                "poster_url": "",
            },
            {
                "title": "The Batman",
                "description": "Детективная история о защитнике Готэма.",
                "genre": "Боевик",
                "duration": 176,
                "age_rating": "16+",
                "poster_url": "",
            },
            {
                "title": "Inside Out 2",
                "description": "Новые эмоции в мире Райли.",
                "genre": "Анимация",
                "duration": 96,
                "age_rating": "6+",
                "poster_url": "",
            },
        ]

        movies = []
        for data in movies_data:
            movie, _ = Movie.objects.get_or_create(
                title=data["title"],
                defaults=data,
            )
            movies.append(movie)

        hall, _ = CinemaHall.objects.get_or_create(
            name="Зал №1",
            defaults={
                "address": "Cinema Center",
                "total_seats": 50,
            },
        )

        hall2, _ = CinemaHall.objects.get_or_create(
            name="Зал №2",
            defaults={
                "address": "Cinema Center",
                "total_seats": 80,
            },
        )

        now = timezone.now().replace(second=0, microsecond=0)
        halls = [hall, hall2]

        for index, movie in enumerate(movies):
            Session.objects.get_or_create(
                movie=movie,
                hall=halls[index % len(halls)],
                starts_at=now + timedelta(days=1, hours=index + 1),
                defaults={"price": 2500 + index * 500},
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: фильмов — {Movie.objects.count()}, "
                f"залов — {CinemaHall.objects.count()}, "
                f"сеансов — {Session.objects.count()}."
            )
        )