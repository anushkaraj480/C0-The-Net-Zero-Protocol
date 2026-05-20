import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'c0.settings')
try:
    django.setup()
except Exception as e:
    print(f"❌ Django Setup Error: {e}")
    print("Please make sure your virtual environment is active before running this script.")
    sys.exit(1)

from auth_app.models import C0User

def main():
    print("=" * 60)
    print("🔑   C0 Net-Zero - Administrative Credentials Resetter   🔑")
    print("=" * 60)
    
    username = input("Enter admin username: ").strip()
    if not username:
        print("❌ Username cannot be empty.")
        return
        
    email = input("Enter email address: ").strip()
    password = input("Enter new password: ").strip()
    
    if len(password) < 8:
        print("❌ Password must be at least 8 characters long.")
        return

    try:
        # Check if user already exists
        user = C0User.objects.filter(username__iexact=username).first() or C0User.objects.filter(email__iexact=email).first()
        
        if user:
            print(f"\nFound existing user: '{user.username}' ({user.email})")
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"\n✅ Password successfully reset!")
            print(f"✅ Staff and Superuser status verified/granted.")
            print(f"\nYou can now log in with:")
            print(f"   - Username/Email: {user.username} (or {user.email})")
            print(f"   - Password: [The password you just entered]")
        else:
            print(f"\nUser '{username}' not found. Creating a new Superuser...")
            if not email:
                email = f"{username}@example.com"
            user = C0User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"\n✅ Superuser successfully created!")
            print(f"\nYou can now log in with:")
            print(f"   - Username: {username}")
            print(f"   - Email: {email}")
            print(f"   - Password: [The password you just entered]")
            
        print("=" * 60)
        print("🚀 Now start your server (`python manage.py runserver`)")
        print("   and log in at http://127.0.0.1:8000/admin/")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error resetting credentials: {e}")

if __name__ == '__main__':
    main()
