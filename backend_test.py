import requests
import sys
import json
from datetime import datetime

class TempleAPITester:
    def __init__(self, base_url="https://divinetrips.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_get_all_temples(self):
        """Test getting all temples"""
        success, response = self.run_test("Get All Temples", "GET", "api/temples", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} temples")
            if len(response) > 0:
                temple = response[0]
                required_fields = ['id', 'name', 'location', 'state', 'deity', 'image']
                missing_fields = [field for field in required_fields if field not in temple]
                if missing_fields:
                    print(f"   ⚠️  Missing fields in temple data: {missing_fields}")
                else:
                    print(f"   ✅ Temple data structure looks good")
        return success, response

    def test_get_temple_detail(self, temple_id):
        """Test getting specific temple details"""
        success, response = self.run_test(
            f"Get Temple Detail ({temple_id})", 
            "GET", 
            f"api/temples/{temple_id}", 
            200
        )
        if success:
            required_fields = ['id', 'name', 'location', 'state', 'deity', 'history', 'timings', 'festivals']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
            else:
                print(f"   ✅ Complete temple detail data")
        return success, response

    def test_search_temples(self):
        """Test temple search functionality"""
        # Test search by name
        success1, _ = self.run_test(
            "Search by Name (Meenakshi)", 
            "GET", 
            "api/search/temples", 
            200,
            params={"q": "Meenakshi"}
        )
        
        # Test search by state
        success2, _ = self.run_test(
            "Search by State (Tamil Nadu)", 
            "GET", 
            "api/search/temples", 
            200,
            params={"state": "Tamil Nadu"}
        )
        
        # Test search by deity
        success3, _ = self.run_test(
            "Search by Deity (Shiva)", 
            "GET", 
            "api/search/temples", 
            200,
            params={"deity": "Shiva"}
        )
        
        return success1 and success2 and success3

    def test_trip_plan_generation(self):
        """Test AI trip plan generation"""
        trip_data = {
            "starting_location": "Delhi",
            "days": 3,
            "preferred_states": ["Tamil Nadu", "Gujarat"]
        }
        
        success, response = self.run_test(
            "Generate Trip Plan", 
            "POST", 
            "api/trip-plan", 
            200,
            data=trip_data
        )
        
        if success:
            required_fields = ['id', 'title', 'duration', 'daily_itinerary', 'total_temples', 'estimated_cost']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
            else:
                print(f"   ✅ Complete trip plan data")
                print(f"   Trip: {response.get('title', 'N/A')}")
                print(f"   Duration: {response.get('duration', 'N/A')} days")
                print(f"   Temples: {response.get('total_temples', 'N/A')}")
                return response.get('id')  # Return trip ID for further testing
        
        return None if not success else response.get('id')

    def test_get_trip_plan(self, trip_id):
        """Test getting trip plan by ID"""
        if not trip_id:
            print("⚠️  Skipping trip plan retrieval - no trip ID available")
            return False
            
        return self.run_test(
            f"Get Trip Plan ({trip_id})", 
            "GET", 
            f"api/trip-plans/{trip_id}", 
            200
        )[0]

def main():
    print("🕉️  Temple Search & Trip Planning API Test Suite")
    print("=" * 60)
    
    # Setup
    tester = TempleAPITester()
    
    # Test 1: Root endpoint
    tester.test_root_endpoint()
    
    # Test 2: Get all temples
    success, temples = tester.test_get_all_temples()
    
    # Test 3: Get temple details (use first temple if available)
    if success and temples and len(temples) > 0:
        temple_id = temples[0].get('id')
        if temple_id:
            tester.test_get_temple_detail(temple_id)
        else:
            print("⚠️  No temple ID found in first temple")
    
    # Test 4: Search functionality
    tester.test_search_temples()
    
    # Test 5: Trip plan generation
    trip_id = tester.test_trip_plan_generation()
    
    # Test 6: Get trip plan by ID
    if trip_id:
        tester.test_get_trip_plan(trip_id)
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())