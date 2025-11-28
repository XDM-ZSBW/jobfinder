"""
Test script to make a Twilio call using credentials from mykeys.zip API
Fetches credentials from https://mykeys.zip and makes a test call from 626-995-9974 to 213-248-4250
"""
import os
import json
import sys
import requests
from requests.auth import HTTPBasicAuth
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# MyKeys API configuration - uses environment variables with fallback to defaults
MYKEYS_URL = os.getenv("MYKEYS_URL", "https://mykeys.zip")
MYKEYS_USER = os.getenv("MYKEYS_USER", "admin")
MYKEYS_PASS = os.getenv("MYKEYS_PASS", "XRi6TgSrwfeuK8taYzhknoJc")

def fetch_credentials_from_mykeys(secret_name="twilio-credentials", ecosystem="jobmatch"):
    """Fetch Twilio credentials from mykeys.zip API."""
    print(f"[INFO] Fetching credentials from {MYKEYS_URL}...")
    
    auth = HTTPBasicAuth(MYKEYS_USER, MYKEYS_PASS)
    
    # Try both API endpoint formats
    endpoints_to_try = [
        f"{MYKEYS_URL}/api/secrets/{secret_name}",  # Simple format (from credentials.py)
        f"{MYKEYS_URL}/api/v1/secrets/{ecosystem}/{secret_name}",  # Ecosystem format (from server.js)
    ]
    
    last_error = None
    for endpoint in endpoints_to_try:
        try:
            print(f"[INFO] Trying endpoint: {endpoint}")
            response = requests.get(
                endpoint,
                auth=auth,
                timeout=10,
                verify=True
            )
        
            if response.status_code == 200:
                data = response.json()
                value = data.get('value', '')
                
                # Parse value if it's JSON string
                if isinstance(value, str):
                    try:
                        creds = json.loads(value)
                    except json.JSONDecodeError:
                        # If not JSON, treat as plain text and try to extract
                        creds = {'value': value}
                else:
                    creds = value if isinstance(value, dict) else {'value': value}
                
                # Extract credentials in various possible formats
                twilio_account_sid = (
                    creds.get('TWILIO_ACCOUNT_SID') or 
                    creds.get('twilio_account_sid') or 
                    creds.get('account_sid') or
                    creds.get('AccountSid') or
                    creds.get('accountSid')
                )
                twilio_auth_token = (
                    creds.get('TWILIO_AUTH_TOKEN') or 
                    creds.get('twilio_auth_token') or 
                    creds.get('auth_token') or
                    creds.get('AuthToken') or
                    creds.get('authToken')
                )
                
                if twilio_account_sid and twilio_auth_token:
                    print(f"[SUCCESS] Retrieved Twilio credentials from mykeys.zip using: {endpoint}")
                    return twilio_account_sid, twilio_auth_token
                else:
                    print(f"[WARN] Credentials found but missing required fields")
                    print(f"   Available keys: {list(creds.keys())}")
                    last_error = ValueError("Twilio credentials incomplete - missing account_sid or auth_token")
                    continue  # Try next endpoint
                    
            elif response.status_code == 404:
                last_error = FileNotFoundError(f"Secret '{secret_name}' not found at {endpoint}")
                continue  # Try next endpoint
            elif response.status_code == 401:
                last_error = ValueError("Authentication failed - check mykeys.zip credentials")
                continue  # Try next endpoint
            elif response.status_code == 502:
                last_error = ConnectionError(f"Bad Gateway (502) - mykeys.zip service may be down or unreachable")
                continue  # Try next endpoint
            else:
                last_error = ValueError(f"HTTP {response.status_code} from {endpoint}: {response.text[:200]}")
                continue  # Try next endpoint
                
        except requests.exceptions.RequestException as e:
            last_error = e
            continue  # Try next endpoint
    
    # If we get here, all endpoints failed
    if isinstance(last_error, FileNotFoundError):
        raise last_error
    elif isinstance(last_error, ValueError) and "incomplete" in str(last_error):
        raise last_error
    elif isinstance(last_error, ConnectionError):
        raise last_error
    elif isinstance(last_error, requests.exceptions.ConnectionError):
        raise ConnectionError(f"Cannot connect to {MYKEYS_URL}. Verify the service is accessible.")
    elif isinstance(last_error, requests.exceptions.Timeout):
        raise TimeoutError(f"Timeout connecting to {MYKEYS_URL}")
    else:
        raise Exception(f"All endpoints failed. Last error: {last_error}")


def make_test_call(account_sid, auth_token, from_number, to_number):
    """Make a test call using Twilio."""
    print(f"\n[INFO] Making test call...")
    print(f"   From: {from_number}")
    print(f"   To: {to_number}")
    
    try:
        client = Client(account_sid, auth_token)
        
        # Make the call
        call = client.calls.create(
            to=to_number,
            from_=from_number,
            url='http://demo.twilio.com/docs/voice.xml',  # Simple TwiML demo
            method='GET'
        )
        
        print(f"\n[SUCCESS] Call initiated successfully!")
        print(f"   Call SID: {call.sid}")
        print(f"   Status: {call.status}")
        print(f"\n[INFO] Call Details:")
        print(f"   - From: {call.from_ if hasattr(call, 'from_') else call.from}")
        print(f"   - To: {call.to}")
        print(f"   - Status: {call.status}")
        if hasattr(call, 'direction'):
            print(f"   - Direction: {call.direction}")
        
        return call
        
    except TwilioException as e:
        print(f"\n[ERROR] Twilio Error: {e}")
        print(f"   Error Code: {e.code if hasattr(e, 'code') else 'N/A'}")
        print(f"   Error Message: {e.msg if hasattr(e, 'msg') else str(e)}")
        raise
    except Exception as e:
        print(f"\n[ERROR] Unexpected Error: {e}")
        raise


def main():
    """Main function to fetch credentials from mykeys.zip and make call."""
    print("=" * 60)
    print("Twilio Test Call Script")
    print("=" * 60)
    print(f"Using mykeys.zip credential service: {MYKEYS_URL}")
    
    # Configuration
    secret_name = "twilio-credentials"  # Secret name in mykeys.zip
    from_number = "+16269959974"  # 626-995-9974
    to_number = "+12132484250"    # 213-248-4250
    
    # Allow custom secret name as command line argument
    if len(sys.argv) > 1:
        secret_name = sys.argv[1]
        print(f"\nUsing custom secret name: {secret_name}")
    
    try:
        # Fetch credentials from mykeys.zip API
        account_sid, auth_token = fetch_credentials_from_mykeys(secret_name)
        
        if not account_sid or not auth_token:
            print("[ERROR] Failed to fetch credentials")
            return
        
        print(f"\n[SUCCESS] Credentials retrieved successfully")
        print(f"   Account SID: {account_sid[:10]}...")
        print(f"   Auth Token: {auth_token[:10]}...")
        
        # Make the call
        call = make_test_call(account_sid, auth_token, from_number, to_number)
        
        print("\n" + "=" * 60)
        print("[SUCCESS] Test call completed successfully!")
        print("=" * 60)
        
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")
        print(f"\nThe secret '{secret_name}' was not found in mykeys.zip.")
        print("Please ensure the Twilio credentials are stored in mykeys.zip.")
        print(f"\nUsage: python test_twilio_call.py [secret_name]")
        print(f"Default secret name: twilio-credentials")
    except ValueError as e:
        print(f"\n[ERROR] {e}")
        print("\nPlease check:")
        print("  1. The secret exists in mykeys.zip")
        print("  2. The secret contains 'account_sid' and 'auth_token' fields")
        print("  3. The credentials are valid")
    except ConnectionError as e:
        print(f"\n[ERROR] {e}")
        print("\nPlease verify:")
        print("  1. mykeys.zip service is running and accessible")
        print("  2. DNS is configured correctly")
        print("  3. Network connectivity is available")
    except TimeoutError as e:
        print(f"\n[ERROR] {e}")
        print("\nThe mykeys.zip service did not respond in time.")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

