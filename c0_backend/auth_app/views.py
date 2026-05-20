from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import C0User
from .serializers import RegisterSerializer, UserInfoSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Create a new user account."""

    queryset = C0User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    """
    POST /api/auth/login/ — Authenticate and return JWT tokens.
    Accepts { username, password } where 'username' can be
    either the actual username OR the user's email address.
    Returns  { access, refresh }.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"\n{'='*50}")
        print(f"[LOGIN] Request received")
        print(f"[LOGIN] Data: {request.data}")
        identifier = request.data.get('username', '').strip()
        password = request.data.get('password')
        print(f"[LOGIN] identifier='{identifier}', password_length={len(password) if password else 0}")

        if not identifier or not password:
            print(f"[LOGIN] REJECTED: missing identifier or password")
            return Response(
                {'detail': 'Username/email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Look up by username OR email so users can sign in with either
        try:
            user = C0User.objects.get(
                Q(username__iexact=identifier) | Q(email__iexact=identifier)
            )
            print(f"[LOGIN] Found user: {user.username} (email={user.email}, active={user.is_active})")
        except C0User.DoesNotExist:
            print(f"[LOGIN] REJECTED: No user found for '{identifier}'")
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except C0User.MultipleObjectsReturned:
            print(f"[LOGIN] REJECTED: Multiple users found for '{identifier}'")
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        password_ok = user.check_password(password)
        print(f"[LOGIN] Password check result: {password_ok}")

        if not password_ok:
            print(f"[LOGIN] REJECTED: wrong password")
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        print(f"[LOGIN] SUCCESS: tokens generated for {user.username}")
        print(f"{'='*50}\n")
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(APIView):
    """GET /api/auth/me/ — Return the authenticated user's profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)
