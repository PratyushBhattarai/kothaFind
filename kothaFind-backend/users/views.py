from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer

class MeView(APIView):
    """Return current logged-in user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RegisterRoleView(APIView):
    """Called after Firebase sign-up to set role + extra info."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.role = request.data.get("role", "rentee")
        user.phone = request.data.get("phone", "")
        user.district = request.data.get("district", "")
        user.display_name = request.data.get("display_name", user.display_name)
        user.save()
        return Response(UserSerializer(user).data)