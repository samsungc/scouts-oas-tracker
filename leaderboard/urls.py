from django.urls import path
from . import views

urlpatterns = [
    path('activity/', views.ActivityLeaderboardView.as_view(), name='leaderboard-activity'),
    path('category-champions/', views.CategoryChampionsView.as_view(), name='leaderboard-champions'),
    path('my-stats/', views.MyStatsView.as_view(), name='leaderboard-my-stats'),
]
