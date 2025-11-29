"""Retry the Twilio call with better TwiML"""
import json
import sys
import requests
from requests.auth import HTTPBasicAuth
from twilio.rest import Client

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Get credentials
auth = HTTPBasicAuth('admin', 'XRi6TgSrwfeuK8taYzhknoJc')
r = requests.get('https://mykeys.zip/api/secrets/twilio-credentials', auth=auth, timeout=10)
data = r.json()
creds = json.loads(data['value']) if isinstance(data.get('value'), str) else data.get('value')

# Initialize Twilio client
client = Client(creds['account_sid'], creds['auth_token'])

# Cancel the stuck call
print("Canceling stuck call...")
try:
    stuck_call = client.calls('CA9e05fb33b08432bb0a9a50c6d181fb49')
    stuck_call.update(status='canceled')
    print("[OK] Stuck call canceled")
except Exception as e:
    print(f"[WARN] Could not cancel call: {e}")

# Make a new call with a better TwiML URL
print("\nMaking new test call...")
print("From: +16269959974")
print("To: +12132484250")

# Use a TwiML URL that will play a message and hang up
twiml_url = 'https://handler.twilio.com/twiml/EH8d8c8c8c8c8c8c8c8c8c8c8c8c8c8c'  # This is a demo handler

# Actually, let's use the jobmatch.zip voice endpoint if available, or a simple TwiML
# For now, let's use a simple TwiML bin or the demo
twiml_url = 'http://demo.twilio.com/docs/voice.xml'

call = client.calls.create(
    to='+12132484250',
    from_='+16269959974',
    url=twiml_url,
    method='GET',
    timeout=30  # 30 second timeout
)

print(f"\n[SUCCESS] New call initiated!")
print(f"Call SID: {call.sid}")
print(f"Status: {call.status}")
print(f"\nThe call should ring your phone (+12132484250) now.")
print(f"Check the call status with: python check_call_status.py")




