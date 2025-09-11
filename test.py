import requests
import json
from http.cookiejar import LWPCookieJar
import os

BASE_URL = "http://localhost:5000/api"
session = requests.Session()

def setup_session():
    """Configure session with proper headers and cookie handling"""
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })

def print_response(response):
    print(f"Status Code: {response.status_code}")
    print("Headers:", dict(response.headers))
    print("Cookies:", dict(response.cookies))
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)
    print("-" * 80)

def test_apis():
    setup_session()

    # 1. Health Check
    print("\n=== Testing Health Check ===")
    response = session.get(f"{BASE_URL}/health")
    print_response(response)

    # 2. Login and store session cookie
    print("\n=== Testing Login ===")
    login_data = {
        "username": "testuser",
        "password": "securepass1234"
    }
    response = session.post(f"{BASE_URL}/login", json=login_data)
    print_response(response)

    if response.status_code == 200:
        # Store session cookie from login response
        session_cookie = response.cookies.get('session')
        if session_cookie:
            # Set cookie for all subsequent requests
            session.cookies.set('session', session_cookie)
            
        # 3. Get Profile
        print("\n=== Testing Get Profile ===")
        response = session.get(f"{BASE_URL}/profile")
        print_response(response)

        # 4. Get Dashboard Data
        print("\n=== Testing Get Dashboard ===")
        response = session.get(f"{BASE_URL}/user/dashboard")
        print_response(response)

        # 5. Get Linked Accounts
        print("\n=== Testing Get Linked Accounts ===")
        response = session.get(f"{BASE_URL}/user/accounts")
        print_response(response)

        # 6. Get Transactions
        print("\n=== Testing Get Transactions ===")
        response = session.get(f"{BASE_URL}/user/transactions")
        print_response(response)

        # 7. Get Balance
        print("\n=== Testing Get Balance ===")
        response = session.get(f"{BASE_URL}/user/balance")
        print_response(response)

        # 8. Get User Preferences
        print("\n=== Testing Get Preferences ===")
        response = session.get(f"{BASE_URL}/user/preferences")
        print_response(response)

        # 9. Update User Preferences
        print("\n=== Testing Update Preferences ===")
        pref_data = {
            "theme": "dark",
            "notifications_enabled": True
        }
        response = session.put(f"{BASE_URL}/user/preferences", json=pref_data)
        print_response(response)

        # 10. Get User Sessions
        print("\n=== Testing Get Sessions ===")
        response = session.get(f"{BASE_URL}/sessions")
        print_response(response)

        # 11. Get Goals
        print("\n=== Testing Get Goals ===")
        response = session.get(f"{BASE_URL}/user/goals")
        print_response(response)

        # 12. Get Goals Summary
        print("\n=== Testing Get Goals Summary ===")
        response = session.get(f"{BASE_URL}/user/goals/summary")
        print_response(response)

        # 13. Test Stock Price API
        print("\n=== Testing Stock Price API ===")
        stock_data = {
            "ticker": "AAPL",
            "timeframe": "1d"
        }
        response = requests.post(f"{BASE_URL}/open_prices", json=stock_data)
        print_response(response)

        # 14. Get User Activity
        print("\n=== Testing Get User Activity ===")
        response = session.get(f"{BASE_URL}/user/activity?days=30")
        print_response(response)

        # 15. Get User Summary
        print("\n=== Testing Get User Summary ===")
        response = session.get(f"{BASE_URL}/user/summary")
        print_response(response)

        # Finally, test logout
        print("\n=== Testing Logout ===")
        response = session.post(f"{BASE_URL}/logout")
        print_response(response)
        
        # Clear session cookies
        session.cookies.clear()

def main():
    try:
        test_apis()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Is Flask running?")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()