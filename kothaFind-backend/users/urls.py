from django.urls import path
from .views import MeView, RegisterRoleView

urlpatterns = [
    path("me/", MeView.as_view()),
    path("register/", RegisterRoleView.as_view()),
]