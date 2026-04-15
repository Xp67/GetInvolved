import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Get a user that has an affiliate code
inviter = User.objects.exclude(affiliate_code='').first()
if not inviter:
    print("No inviter found with an affiliate code.")
    exit(1)

print(f"Inviter: {inviter.username}, Code: {inviter.affiliate_code}")

# Register a new user just like the API does
from api.serializers import RegisterSerializer

random_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
data = {
    "email": random_email,
    "password": "Password123!",
    "affiliated_to_code": inviter.affiliate_code
}

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    new_user = serializer.save()
    print(f"Newly registered user: {new_user.username}")
    print(f"Affiliated to: {new_user.affiliated_to}")
    if new_user.affiliated_to == inviter:
        print("SUCCESS! The user is correctly affiliated to the inviter.")
    else:
        print("ERROR: Affiliation did not work.")
    
    # Cleanup
    new_user.delete()
    print("Cleaned up test user.")
else:
    print("Serializer errors:", serializer.errors)
