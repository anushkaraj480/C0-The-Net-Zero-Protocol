from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import C0User

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate
    using either their username or email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get('username')
            
        try:
            # Look up by username or email (case-insensitive)
            user = C0User.objects.get(
                Q(username__iexact=username) | Q(email__iexact=username)
            )
        except (C0User.DoesNotExist, C0User.MultipleObjectsReturned):
            # Run the default password hasher to prevent timing attacks
            C0User().set_password(password)
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
