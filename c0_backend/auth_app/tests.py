from django.test import TestCase

from .models import C0User


class C0UserModelTest(TestCase):
    """Basic tests for the custom user model."""

    def test_create_user(self):
        user = C0User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='farmer',
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'farmer')
        self.assertTrue(user.check_password('testpass123'))

    def test_default_role(self):
        user = C0User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123',
        )
        self.assertEqual(user.role, 'farmer')
