from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth as firebase_auth
import firebase_admin_setup  # triggers initialization
from users.models import User

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None  # no token, move on

        token = auth_header.split("Bearer ")[1]

        try:
            decoded = firebase_auth.verify_id_token(token)
        except Exception:
            raise AuthenticationFailed("Invalid or expired Firebase token.")

        uid = decoded.get("uid")
        email = decoded.get("email", "")
        name = decoded.get("name", "")

        # get or create user in Django DB
        user, created = User.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                "email": email,
                "display_name": name,
            }
        )

        return (user, None)