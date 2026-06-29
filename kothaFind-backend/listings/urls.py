# listings/urls.py
from django.urls import path
from .views import (
    RenterLocationView, RenterContactView, RenterPropertyView,
    AcceptTermsView, RoomListCreateView, RoomDetailView,
    PublicRoomDetailView, RenterStatsView,
    InquiryCreateView, RenterInquiriesView,
)

urlpatterns = [
    # Onboarding
    path("renter/location/",      RenterLocationView.as_view()),
    path("renter/contact/",       RenterContactView.as_view()),
    path("renter/property/",      RenterPropertyView.as_view()),
    path("renter/accept-terms/",  AcceptTermsView.as_view()),

    # Rooms (renter-owned)
    path("renter/rooms/",         RoomListCreateView.as_view()),
    path("renter/rooms/<int:pk>/",RoomDetailView.as_view()),
    path("renter/stats/",         RenterStatsView.as_view()),
    path("renter/inquiries/",     RenterInquiriesView.as_view()),

    # Public
    path("rooms/<int:pk>/",       PublicRoomDetailView.as_view()),
    path("rooms/<int:pk>/inquire/",InquiryCreateView.as_view()),
]
