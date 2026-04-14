import requests
import sys
import time
from datetime import datetime

class CorporateActionsAPITester:
    def __init__(self, base_url="https://dividend-tracker-27.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_action_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_get_actions(self):
        """Test GET /api/actions - should return 10 seeded actions"""
        success, response = self.run_test("Get All Actions", "GET", "actions", 200)
        if success:
            actions = response
            if len(actions) == 10:
                print(f"✅ Correct number of seeded actions: {len(actions)}")
                # Verify action structure
                if actions and all(key in actions[0] for key in ['id', 'ticker', 'company_name', 'action_type', 'status']):
                    print("✅ Action structure is correct")
                    return True
                else:
                    print("❌ Action structure is missing required fields")
            else:
                print(f"❌ Expected 10 actions, got {len(actions)}")
        return success

    def test_get_summary(self):
        """Test GET /api/actions/summary - should return correct metrics"""
        success, response = self.run_test("Get Summary", "GET", "actions/summary", 200)
        if success:
            expected_values = {
                'total_actions': 10,
                'pending_count': 5,
                'securities_affected': 10,
                'avg_processing_time': 2.4
            }
            
            all_correct = True
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"✅ {key}: {actual} (correct)")
                else:
                    print(f"❌ {key}: expected {expected}, got {actual}")
                    all_correct = False
            
            return all_correct
        return success

    def test_create_action(self):
        """Test POST /api/actions - create new action with Alpha Vantage enrichment"""
        test_data = {
            "ticker": "TEST",
            "action_type": "Dividend",
            "ex_date": "2026-12-31",
            "announcement": "Test dividend announcement"
        }
        
        success, response = self.run_test("Create New Action", "POST", "actions", 200, test_data)
        if success:
            # Store the created action ID for later tests
            self.created_action_id = response.get('id')
            
            # Verify the response structure
            required_fields = ['id', 'ticker', 'company_name', 'action_type', 'status', 'ex_date']
            if all(field in response for field in required_fields):
                print("✅ Created action has all required fields")
                if response['status'] == 'Pending':
                    print("✅ New action has Pending status")
                    if response['ticker'] == 'TEST':
                        print("✅ Ticker is correct")
                        return True
                    else:
                        print(f"❌ Expected ticker TEST, got {response['ticker']}")
                else:
                    print(f"❌ Expected status Pending, got {response['status']}")
            else:
                print("❌ Created action missing required fields")
        return success

    def test_process_action(self):
        """Test PUT /api/actions/{id}/process - change status to Processing"""
        if not self.created_action_id:
            print("❌ No action ID available for processing test")
            return False
            
        success, response = self.run_test(
            "Process Action", 
            "PUT", 
            f"actions/{self.created_action_id}/process", 
            200
        )
        
        if success:
            if response.get('status') == 'Processing':
                print("✅ Action status changed to Processing")
                return True
            else:
                print(f"❌ Expected status Processing, got {response.get('status')}")
        return success

    def test_complete_action(self):
        """Test PUT /api/actions/{id}/complete - change status to Completed"""
        if not self.created_action_id:
            print("❌ No action ID available for completion test")
            return False
            
        success, response = self.run_test(
            "Complete Action", 
            "PUT", 
            f"actions/{self.created_action_id}/complete", 
            200
        )
        
        if success:
            if response.get('status') == 'Completed':
                print("✅ Action status changed to Completed")
                return True
            else:
                print(f"❌ Expected status Completed, got {response.get('status')}")
        return success

    def test_process_nonexistent_action(self):
        """Test processing non-existent action - should return 404"""
        fake_id = "non-existent-id"
        success, _ = self.run_test(
            "Process Non-existent Action", 
            "PUT", 
            f"actions/{fake_id}/process", 
            404
        )
        return success

def main():
    print("🚀 Starting Corporate Actions API Tests")
    print("=" * 50)
    
    tester = CorporateActionsAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_actions,
        tester.test_get_summary,
        tester.test_create_action,
        tester.test_process_action,
        tester.test_complete_action,
        tester.test_process_nonexistent_action,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())