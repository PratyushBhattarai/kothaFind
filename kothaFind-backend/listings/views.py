# listings/views.py
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import RenterProfile, Property, Room, RoomMedia, RoomView, Inquiry
from .serializers import (
    RenterProfileSerializer, PropertySerializer,
    RoomSerializer, InquirySerializer,
)


# ── Base view that handles CORS preflight OPTIONS ─────────────────────────────
class CORSAPIView(APIView):
    def options(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_200_OK)
        response["Access-Control-Allow-Origin"]  = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, X-Requested-With"
        response["Access-Control-Max-Age"]       = "86400"
        return response


# ── Onboarding steps ──────────────────────────────────────────────────────────

class RenterLocationView(CORSAPIView):
    """Step 1 — save or update renter's property location."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = RenterProfile.objects.get_or_create(user=request.user)
        profile.latitude  = request.data.get("latitude")
        profile.longitude = request.data.get("longitude")
        profile.address   = request.data.get("address", "")
        profile.ward      = request.data.get("ward", "")
        profile.tole      = request.data.get("tole", "")
        profile.district  = request.data.get("district", "Kathmandu")
        profile.save()
        return Response(RenterProfileSerializer(profile).data, status=status.HTTP_200_OK)


class RenterContactView(CORSAPIView):
    """Step 2 — save contact info."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = RenterProfile.objects.get_or_create(user=request.user)
        profile.phone     = request.data.get("phone", "")
        profile.alt_phone = request.data.get("alt_phone", "")
        profile.whatsapp  = request.data.get("whatsapp", "")
        profile.email     = request.data.get("email", "")
        profile.save()
        return Response(RenterProfileSerializer(profile).data)


class RenterPropertyView(CORSAPIView):
    """Step 3 — create or update the property/building."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        prop = Property.objects.create(
            owner       = request.user,
            name        = data.get("name"),
            type        = data.get("type", "house"),
            floors      = data.get("floors", 1),
            year_built  = data.get("year_built") or None,
            description = data.get("description", ""),
            amenities   = data.get("amenities", []),
        )
        return Response(PropertySerializer(prop).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        props = Property.objects.filter(owner=request.user, is_active=True)
        return Response(PropertySerializer(props, many=True).data)


class AcceptTermsView(CORSAPIView):
    """Step 5 — record that renter agreed to T&C."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.data.get("agreed"):
            return Response(
                {"error": "You must agree to terms."},
                status=status.HTTP_400_BAD_REQUEST
            )
        profile, _ = RenterProfile.objects.get_or_create(user=request.user)
        profile.terms_agreed    = True
        profile.terms_agreed_at = timezone.now()
        profile.save()
        request.user.is_verified = True
        request.user.save()
        return Response({"status": "accepted"})


# ── Rooms CRUD ────────────────────────────────────────────────────────────────

class RoomListCreateView(CORSAPIView):
    """Step 4 — add rooms + media. Also GET all rooms for dashboard."""
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        rooms = Room.objects.filter(
            property__owner=request.user
        ).prefetch_related("media").order_by("-created_at")
        return Response(RoomSerializer(rooms, many=True, context={"request": request}).data)

    def post(self, request):
        import json

        prop_id  = request.data.get("property")
        features = request.data.get("features", "[]")
        if isinstance(features, str):
            try:    features = json.loads(features)
            except: features = []

        try:
            prop = Property.objects.get(id=prop_id, owner=request.user)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        room = Room.objects.create(
            property        = prop,
            title           = request.data.get("title"),
            room_type       = request.data.get("room_type", "single"),
            floor           = request.data.get("floor", 1),
            size_sqft       = request.data.get("size_sqft") or None,
            price_per_month = request.data.get("price_per_month"),
            description     = request.data.get("description", ""),
            features        = features,
        )

        for f in request.FILES.getlist("media"):
            media_type = "video" if f.content_type.startswith("video") else "image"
            RoomMedia.objects.create(room=room, file=f, media_type=media_type)

        return Response(
            RoomSerializer(room, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class RoomDetailView(CORSAPIView):
    """PATCH to update status. GET for single room."""
    permission_classes = [IsAuthenticated]

    def get_room(self, pk, user):
        try:    return Room.objects.get(pk=pk, property__owner=user)
        except: return None

    def patch(self, request, pk):
        room = self.get_room(pk, request.user)
        if not room:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        allowed = ["status", "title", "price_per_month", "description", "features"]
        for field in allowed:
            if field in request.data:
                setattr(room, field, request.data[field])
        room.save()
        return Response(RoomSerializer(room, context={"request": request}).data)


# ── Public room detail (view counter) ─────────────────────────────────────────

class PublicRoomDetailView(CORSAPIView):
    """Public endpoint — increments view count once per session."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk, status="available")
        except Room.DoesNotExist:
            return Response({"error": "Not found."}, status=404)

        session_key = request.session.session_key or ""
        if not session_key:
            request.session.create()
            session_key = request.session.session_key

        _, created = RoomView.objects.get_or_create(
            room=room, session_key=session_key,
            defaults={"ip_address": request.META.get("REMOTE_ADDR")},
        )
        if created:
            Room.objects.filter(pk=pk).update(view_count=room.view_count + 1)
            room.refresh_from_db()

        return Response(RoomSerializer(room, context={"request": request}).data)


# ── Public rooms list (rentee browsing) ───────────────────────────────────────

class PublicRoomsListView(CORSAPIView):
    """Public endpoint — list all available rooms with optional filters."""
    permission_classes = [AllowAny]

    def get(self, request):
        rooms = Room.objects.filter(
            status="available"
        ).prefetch_related("media", "property")

        district  = request.query_params.get("district")
        room_type = request.query_params.get("room_type")
        max_price = request.query_params.get("max_price")

        if district:  rooms = rooms.filter(property__district=district)
        if room_type: rooms = rooms.filter(room_type=room_type)
        if max_price: rooms = rooms.filter(price_per_month__lte=max_price)

        rooms = rooms.order_by("-created_at")
        return Response(
            RoomSerializer(rooms, many=True, context={"request": request}).data
        )


# ── Dashboard stats ───────────────────────────────────────────────────────────

class RenterStatsView(CORSAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(property__owner=request.user)
        return Response({
            "total_views":     sum(r.view_count for r in rooms),
            "total_inquiries": sum(r.inquiry_count for r in rooms),
            "active_rooms":    rooms.filter(status="available").count(),
            "rented_rooms":    rooms.filter(status="rented").count(),
        })


# ── Inquiries ─────────────────────────────────────────────────────────────────

class InquiryCreateView(CORSAPIView):
    """Public endpoint — tenant sends inquiry about a room."""
    permission_classes = [AllowAny]

    def post(self, request):
        s = InquirySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)


class RenterInquiriesView(CORSAPIView):
    """Renter views inquiries for their rooms."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        inquiries = Inquiry.objects.filter(
            room__property__owner=request.user
        ).order_by("-created_at")
        return Response(InquirySerializer(inquiries, many=True).data)
