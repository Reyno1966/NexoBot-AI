import requests
from app.core.config import settings

def test_evolution_api():
    base_url = "https://evolution-api.nexobot.com"
    api_key = "ClaveNexo202Rey"
    
    print(f"Testing Evolution API at {base_url}")
    print(f"Using API Key: {api_key}")
    
    # Try to list instances
    url = f"{base_url}/instance/fetchInstances"
    headers = {"apikey": api_key}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_evolution_api()
