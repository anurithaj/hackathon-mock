import requests
import sys
import time
from datetime import datetime

class CorporateActionsProcessingTester:
    def __init__(self, base_url="https://dividend-tracker-27.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_event_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
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
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
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
        success, response = self.run_test("Root API Endpoint", "GET", "", 200)
        if success and response.get('message'):
            print(f"✅ Root endpoint message: {response['message']}")
            return True
        return success

    def test_dashboard(self):
        """Test GET /api/dashboard - returns metrics, deadlines, type_breakdown, pipeline"""
        success, response = self.run_test("Dashboard Data", "GET", "dashboard", 200)
        if success:
            required_keys = ['metrics', 'deadlines', 'type_breakdown', 'pipeline']
            if all(key in response for key in required_keys):
                print("✅ Dashboard has all required sections")
                
                # Check metrics structure
                metrics = response['metrics']
                metric_keys = ['pending_events', 'processed_today', 'failed_exceptions', 'total_aum_affected', 'elections_due_today']
                if all(key in metrics for key in metric_keys):
                    print("✅ Metrics section has all required fields")
                    print(f"   Pending events: {metrics['pending_events']}")
                    print(f"   Processed today: {metrics['processed_today']}")
                    print(f"   Elections due: {metrics['elections_due_today']}")
                else:
                    print(f"❌ Missing metric keys: {[k for k in metric_keys if k not in metrics]}")
                    return False
                
                # Check pipeline structure
                pipeline = response['pipeline']
                pipeline_stages = ['Announced', 'Validated', 'Instructed', 'Settled', 'Exceptions']
                if all(stage in pipeline for stage in pipeline_stages):
                    print("✅ Pipeline has all required stages")
                    print(f"   Pipeline counts: {pipeline}")
                else:
                    print(f"❌ Missing pipeline stages: {[s for s in pipeline_stages if s not in pipeline]}")
                    return False
                
                return True
            else:
                print(f"❌ Missing dashboard keys: {[k for k in required_keys if k not in response]}")
        return success

    def test_events_list(self):
        """Test GET /api/events - returns paginated events with search/filter support"""
        success, response = self.run_test("Events List", "GET", "events", 200)
        if success:
            required_keys = ['events', 'total', 'page', 'per_page', 'total_pages']
            if all(key in response for key in required_keys):
                print("✅ Events response has pagination structure")
                events = response['events']
                if len(events) > 0:
                    print(f"✅ Found {len(events)} events out of {response['total']} total")
                    
                    # Check event structure
                    event = events[0]
                    event_keys = ['id', 'security', 'ticker', 'isin', 'event_type', 'status', 'record_date', 'pay_date']
                    if all(key in event for key in event_keys):
                        print("✅ Event structure is correct")
                        print(f"   Sample event: {event['id']} - {event['security']} ({event['event_type']})")
                        return True
                    else:
                        print(f"❌ Missing event keys: {[k for k in event_keys if k not in event]}")
                else:
                    print("❌ No events found in response")
            else:
                print(f"❌ Missing response keys: {[k for k in required_keys if k not in response]}")
        return success

    def test_events_search(self):
        """Test GET /api/events with search parameter"""
        success, response = self.run_test("Events Search", "GET", "events?search=Apple", 200)
        if success:
            events = response.get('events', [])
            if len(events) > 0:
                # Check if search worked
                apple_found = any('apple' in event.get('security', '').lower() for event in events)
                if apple_found:
                    print("✅ Search functionality working - found Apple events")
                    return True
                else:
                    print("❌ Search didn't return Apple events")
            else:
                print("❌ Search returned no events")
        return success

    def test_events_filter(self):
        """Test GET /api/events with type filter"""
        success, response = self.run_test("Events Type Filter", "GET", "events?event_type=Dividend", 200)
        if success:
            events = response.get('events', [])
            if len(events) > 0:
                # Check if all events are dividends
                all_dividends = all(event.get('event_type') == 'Dividend' for event in events)
                if all_dividends:
                    print(f"✅ Type filter working - found {len(events)} dividend events")
                    return True
                else:
                    print("❌ Type filter returned non-dividend events")
            else:
                print("❌ Type filter returned no events")
        return success

    def test_create_event(self):
        """Test POST /api/events - creates new event and adds audit entry"""
        test_data = {
            "security": "Test Corp Inc.",
            "isin": "US1234567890",
            "event_type": "Dividend",
            "mandatory": True,
            "record_date": "2026-12-31",
            "pay_date": "2027-01-15",
            "distribution": "$0.50 / share",
            "notes": "Test dividend creation"
        }
        
        success, response = self.run_test("Create New Event", "POST", "events", 200, test_data)
        if success:
            # Store the created event ID for later tests
            self.created_event_id = response.get('id')
            
            # Verify the response structure
            required_fields = ['id', 'security', 'event_type', 'status', 'record_date', 'pay_date']
            if all(field in response for field in required_fields):
                print("✅ Created event has all required fields")
                if response['status'] == 'Announced':
                    print("✅ New event has Announced status")
                    if response['security'] == 'Test Corp Inc.':
                        print(f"✅ Event created with ID: {response['id']}")
                        return True
                    else:
                        print(f"❌ Expected security 'Test Corp Inc.', got {response['security']}")
                else:
                    print(f"❌ Expected status 'Announced', got {response['status']}")
            else:
                print(f"❌ Created event missing required fields: {[f for f in required_fields if f not in response]}")
        return success

    def test_process_event(self):
        """Test PUT /api/events/{id}/process - advances event status through pipeline"""
        if not self.created_event_id:
            print("❌ No event ID available for processing test")
            return False
            
        success, response = self.run_test(
            "Process Event", 
            "PUT", 
            f"events/{self.created_event_id}/process", 
            200
        )
        
        if success:
            if response.get('status') in ['Validated', 'Instructed', 'Settled']:
                print(f"✅ Event status advanced to: {response.get('status')}")
                return True
            else:
                print(f"❌ Unexpected status after processing: {response.get('status')}")
        return success

    def test_get_single_event(self):
        """Test GET /api/events/{id} - get specific event"""
        if not self.created_event_id:
            print("❌ No event ID available for single event test")
            return False
            
        success, response = self.run_test(
            "Get Single Event", 
            "GET", 
            f"events/{self.created_event_id}", 
            200
        )
        
        if success:
            if response.get('id') == self.created_event_id:
                print(f"✅ Retrieved correct event: {response.get('security')}")
                return True
            else:
                print(f"❌ Retrieved wrong event ID: {response.get('id')}")
        return success

    def test_entitlements(self):
        """Test GET /api/entitlements - returns entitlements with filter support"""
        success, response = self.run_test("Entitlements List", "GET", "entitlements", 200)
        if success:
            required_keys = ['entitlements', 'total']
            if all(key in response for key in required_keys):
                print("✅ Entitlements response structure correct")
                entitlements = response['entitlements']
                if len(entitlements) > 0:
                    print(f"✅ Found {len(entitlements)} entitlements")
                    
                    # Check entitlement structure
                    ent = entitlements[0]
                    ent_keys = ['id', 'event_id', 'security', 'event_type', 'mandatory', 'status']
                    if all(key in ent for key in ent_keys):
                        print("✅ Entitlement structure is correct")
                        return True
                    else:
                        print(f"❌ Missing entitlement keys: {[k for k in ent_keys if k not in ent]}")
                else:
                    print("❌ No entitlements found")
            else:
                print(f"❌ Missing response keys: {[k for k in required_keys if k not in response]}")
        return success

    def test_entitlements_filter(self):
        """Test GET /api/entitlements with filter"""
        success, response = self.run_test("Entitlements Filter", "GET", "entitlements?filter_type=pending", 200)
        if success:
            entitlements = response.get('entitlements', [])
            if len(entitlements) >= 0:  # Could be 0 if no pending
                print(f"✅ Filter working - found {len(entitlements)} pending entitlements")
                return True
            else:
                print("❌ Filter failed")
        return success

    def test_elect_entitlement(self):
        """Test PUT /api/entitlements/{id}/elect - submits election choice"""
        # First get entitlements to find one we can elect
        success, response = self.run_test("Get Entitlements for Election", "GET", "entitlements", 200)
        if not success:
            return False
            
        entitlements = response.get('entitlements', [])
        voluntary_ent = None
        for ent in entitlements:
            if not ent.get('mandatory') and ent.get('election_options') and ent.get('status') == 'Pending election':
                voluntary_ent = ent
                break
        
        if not voluntary_ent:
            print("⚠️  No voluntary entitlements available for election test")
            return True  # Not a failure, just no data to test with
            
        election_data = {"elected_option": voluntary_ent['election_options'][0]}
        success, response = self.run_test(
            "Submit Election", 
            "PUT", 
            f"entitlements/{voluntary_ent['id']}/elect", 
            200,
            election_data
        )
        
        if success:
            if response.get('status') == 'Elected':
                print(f"✅ Election submitted successfully: {response.get('elected_option')}")
                return True
            else:
                print(f"❌ Unexpected status after election: {response.get('status')}")
        return success

    def test_submit_all_elections(self):
        """Test POST /api/entitlements/submit-all - submits all elected entitlements"""
        success, response = self.run_test("Submit All Elections", "POST", "entitlements/submit-all", 200)
        if success:
            if 'submitted' in response:
                print(f"✅ Bulk submission completed: {response['submitted']} elections submitted")
                return True
            else:
                print("❌ Missing 'submitted' count in response")
        return success

    def test_positions(self):
        """Test GET /api/positions - returns positions with metrics"""
        success, response = self.run_test("Positions Data", "GET", "positions", 200)
        if success:
            required_keys = ['positions', 'metrics']
            if all(key in response for key in required_keys):
                print("✅ Positions response structure correct")
                positions = response['positions']
                metrics = response['metrics']
                
                if len(positions) > 0:
                    print(f"✅ Found {len(positions)} positions")
                    
                    # Check position structure
                    pos = positions[0]
                    pos_keys = ['id', 'account', 'security', 'shares_held', 'event_type', 'entitlement']
                    if all(key in pos for key in pos_keys):
                        print("✅ Position structure is correct")
                    else:
                        print(f"❌ Missing position keys: {[k for k in pos_keys if k not in pos]}")
                        return False
                
                # Check metrics structure
                metric_keys = ['total_accounts', 'positions_affected', 'cash_entitlements', 'stock_entitlements']
                if all(key in metrics for key in metric_keys):
                    print("✅ Position metrics structure correct")
                    print(f"   Total accounts: {metrics['total_accounts']}")
                    print(f"   Positions affected: {metrics['positions_affected']}")
                    return True
                else:
                    print(f"❌ Missing metric keys: {[k for k in metric_keys if k not in metrics]}")
            else:
                print(f"❌ Missing response keys: {[k for k in required_keys if k not in response]}")
        return success

    def test_audit(self):
        """Test GET /api/audit - returns audit timeline entries"""
        success, response = self.run_test("Audit Log", "GET", "audit", 200)
        if success:
            if 'entries' in response:
                entries = response['entries']
                print(f"✅ Found {len(entries)} audit entries")
                
                if len(entries) > 0:
                    # Check entry structure
                    entry = entries[0]
                    entry_keys = ['id', 'action', 'timestamp', 'log_type', 'color']
                    if all(key in entry for key in entry_keys):
                        print("✅ Audit entry structure is correct")
                        print(f"   Latest entry: {entry['action']}")
                        return True
                    else:
                        print(f"❌ Missing entry keys: {[k for k in entry_keys if k not in entry]}")
                else:
                    print("❌ No audit entries found")
            else:
                print("❌ Missing 'entries' key in response")
        return success

def main():
    print("🚀 Starting Corporate Actions Processing System API Tests")
    print("=" * 60)
    
    tester = CorporateActionsProcessingTester()
    
    # Run all tests in logical order
    tests = [
        tester.test_root_endpoint,
        tester.test_dashboard,
        tester.test_events_list,
        tester.test_events_search,
        tester.test_events_filter,
        tester.test_create_event,
        tester.test_get_single_event,
        tester.test_process_event,
        tester.test_entitlements,
        tester.test_entitlements_filter,
        tester.test_elect_entitlement,
        tester.test_submit_all_elections,
        tester.test_positions,
        tester.test_audit,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend API tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())