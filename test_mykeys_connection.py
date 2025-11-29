"""Test connection to mykeys.zip with credentials"""
import os
import requests
from requests.auth import HTTPBasicAuth

# Use environment variables if available, otherwise use defaults
MYKEYS_URL = os.getenv("MYKEYS_URL", "https://mykeys.zip")
MYKEYS_USER = os.getenv("MYKEYS_USER", "admin")
MYKEYS_PASS = os.getenv("MYKEYS_PASS", "XRi6TgSrwfeuK8taYzhknoJc")

print(f"Testing connection to {MYKEYS_URL}")
print(f"Using credentials from: {'Environment variables' if os.getenv('MYKEYS_USER') else 'Default fallback values'}")
print()

auth = HTTPBasicAuth(MYKEYS_USER, MYKEYS_PASS)

try:
    # Test health endpoint
    print("Testing /api/health endpoint...")
    response = requests.get(f"{MYKEYS_URL}/api/health", auth=auth, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("[SUCCESS] Connection successful!")
        print(f"Response: {response.text[:200]}")
    else:
        print(f"[ERROR] Connection failed with status {response.status_code}")
        print(f"Response: {response.text[:200]}")
except requests.exceptions.RequestException as e:
    print(f"[ERROR] Connection error: {e}")




