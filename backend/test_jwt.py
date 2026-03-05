import requests
import json
import jwt

session = requests.Session()
API_URL = "http://localhost:8000"

print("Login in...")
res = session.post(f"{API_URL}/api/token/", data={
    "email": "marco.def4lt@gmail.com",
    "password": "4767937Xp67!"
})

if res.status_code != 200:
    print("Login failed!", res.text)
    exit(1)

token = res.json()["access"]
print("Logged in. Testing Google Wallet download...")

headers = {"Authorization": f"Bearer {token}"}
gw_res = session.get(f"{API_URL}/api/tickets/1/download/google/", headers=headers)

if gw_res.status_code == 200:
    print("Google Wallet Link:", gw_res.json()["url"])
    url = gw_res.json()["url"]
    # estrai token JWT
    jwt_str = url.split("save/")[1]
    
    # Non verifica la firma, ma estrae solo il plain JSON
    decoded = jwt.decode(jwt_str, options={"verify_signature": False})
    print("\n--- DECODED JWT PAYLOAD ---")
    print(json.dumps(decoded, indent=2))
    
else:
    print("Google Wallet Failed:", gw_res.status_code)
    try:
        print(gw_res.json())
    except:
        print(gw_res.text)
