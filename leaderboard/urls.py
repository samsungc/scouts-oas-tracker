from django.urls import path
from . import views

urlpatterns = [
    path('activity/', views.ActivityLeaderboardView.as_view(), name='leaderboard-activity'),
    path('category-champions/', views.CategoryChampionsView.as_view(), name='leaderboard-champions'),
    path('my-achievements/', views.MyAchievementsView.as_view(), name='leaderboard-my-achievements'),
    path('achievements/<str:achievement_id>/scouts/', views.AchievementScoutsView.as_view(), name='leaderboard-achievement-scouts'),
    path('my-stats/', views.MyStatsView.as_view(), name='leaderboard-my-stats'),
    path('points/', views.PointsLeaderboardView.as_view(), name='leaderboard-points'),
    path('streaks/', views.StreakLeaderboardView.as_view(), name='leaderboard-streaks'),
    path('activity-feed/', views.ActivityFeedView.as_view(), name='leaderboard-activity-feed'),
]
