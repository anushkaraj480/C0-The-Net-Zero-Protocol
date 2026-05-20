import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'c0.settings')
django.setup()

from auth_app.models import C0User

def main():
    print("=== C0 Net-Zero Django Admin Privileges Helper ===")
    identifier = input("Enter your username or email address: ").strip()
    
    try:
        user = C0User.objects.filter(username__iexact=identifier).first() or C0User.objects.filter(email__iexact=identifier).first()
        
        if not user:
            print(f"\n❌ Error: No user found with username or email '{identifier}'.")
            print("Please sign up first via the frontend app, or use `python manage.py createsuperuser` instead.")
            return
            
        # Grant admin access
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        print(f"\n🚀 Success! User '{user.username}' has been promoted to a Superuser/Staff account.")
        print("You can now log in to Django Admin at http://localhost:8000/admin/")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == '__main__':
    main()
