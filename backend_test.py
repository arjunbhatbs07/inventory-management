import requests
import sys
import uuid
from datetime import datetime

class InventoryAPITester:
    def __init__(self, base_url="https://pickle-profit.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({"test": name, "status": "PASS", "details": f"Status: {response.status_code}"})
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.status_code >= 400:
                    try:
                        error_detail = response.json().get('detail', 'No detail provided')
                        print(f"   Error: {error_detail}")
                        self.test_results.append({"test": name, "status": "FAIL", "details": f"Status: {response.status_code}, Error: {error_detail}"})
                    except:
                        print(f"   Raw response: {response.text}")
                        self.test_results.append({"test": name, "status": "FAIL", "details": f"Status: {response.status_code}, Raw: {response.text}"})
                else:
                    self.test_results.append({"test": name, "status": "FAIL", "details": f"Status: {response.status_code}"})

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({"test": name, "status": "FAIL", "details": f"Exception: {str(e)}"})
            return False, {}

    def test_register(self, username, password, full_name):
        """Test user registration"""
        success, response = self.run_test(
            "Register User",
            "POST",
            "api/auth/register",
            200,
            data={"username": username, "password": password, "full_name": full_name}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Token acquired: {self.token[:20]}...")
            return True
        return False

    def test_login(self, username, password):
        """Test user login"""
        success, response = self.run_test(
            "Login User",
            "POST",
            "api/auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Token acquired: {self.token[:20]}...")
            return True
        return False

    def test_get_dashboard(self):
        """Test dashboard data retrieval"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "api/dashboard",
            200
        )
        return success

    def test_seed_data(self):
        """Test initial data seeding"""
        success, response = self.run_test(
            "Seed Initial Data",
            "POST",
            "api/seed-data",
            200
        )
        return success

    def test_get_products(self):
        """Test get all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "api/products",
            200
        )
        return success, response if success else []

    def test_create_product(self):
        """Test product creation"""
        product_data = {
            "name": "Test Product",
            "category": "Snacks",
            "buying_price": 100.0,
            "selling_price": 150.0,
            "stock": 10.0,
            "min_stock": 2.0,
            "description": "Test product for API testing",
            "unit": "kg"
        }
        success, response = self.run_test(
            "Create Product",
            "POST",
            "api/products",
            200,
            data=product_data
        )
        return response.get('id') if success else None

    def test_update_product(self, product_id):
        """Test product update"""
        update_data = {
            "name": "Updated Test Product",
            "category": "Snacks",
            "buying_price": 120.0,
            "selling_price": 180.0,
            "stock": 15.0,
            "min_stock": 3.0,
            "description": "Updated test product",
            "unit": "kg"
        }
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"api/products/{product_id}",
            200,
            data=update_data
        )
        return success

    def test_delete_product(self, product_id):
        """Test product deletion"""
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"api/products/{product_id}",
            200
        )
        return success

    def test_create_customer(self):
        """Test customer creation"""
        customer_data = {
            "name": "Test Customer",
            "phone": "9876543210",
            "address": "Test Address, Test City"
        }
        success, response = self.run_test(
            "Create Customer",
            "POST",
            "api/customers",
            200,
            data=customer_data
        )
        return response.get('id') if success else None

    def test_create_order(self, product_id):
        """Test order creation"""
        order_data = {
            "customer_name": "Test Customer",
            "customer_phone": "9876543210",
            "customer_address": "Test Address",
            "items": [{
                "product_id": product_id,
                "product_name": "Test Product",
                "quantity": 2.0,
                "buying_price": 100.0,
                "selling_price": 150.0,
                "unit": "kg"
            }],
            "courier_charges": 50.0,
            "packing_charges": 20.0,
            "gum_tape_cost": 10.0,
            "box_cost": 5.0
        }
        success, response = self.run_test(
            "Create Order",
            "POST",
            "api/orders",
            200,
            data=order_data
        )
        return response.get('id') if success else None

    def test_update_stock(self, product_id):
        """Test stock update"""
        stock_data = {
            "product_id": product_id,
            "quantity": 5.0,
            "action": "add"
        }
        success, response = self.run_test(
            "Update Stock",
            "POST",
            "api/inventory/update-stock",
            200,
            data=stock_data
        )
        return success

    def test_get_reports(self):
        """Test reports endpoints"""
        # Sales report
        success1, _ = self.run_test(
            "Get Sales Report",
            "GET",
            "api/reports/sales?period=daily",
            200
        )
        
        # Best selling products
        success2, _ = self.run_test(
            "Get Best Selling Products",
            "GET",
            "api/reports/best-selling",
            200
        )
        
        # Export CSV
        success3, _ = self.run_test(
            "Export CSV Report",
            "GET",
            "api/reports/export-csv",
            200
        )
        
        return success1 and success2 and success3

def main():
    # Setup
    tester = InventoryAPITester()
    test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
    test_password = "test123"
    test_fullname = "Test User"

    print("=" * 50)
    print("INVENTORY MANAGEMENT API TESTING")
    print("=" * 50)

    # Test registration and authentication
    if not tester.test_register(test_username, test_password, test_fullname):
        print("❌ Registration failed, stopping tests")
        return 1

    # Seed initial data
    tester.test_seed_data()

    # Test dashboard
    tester.test_get_dashboard()

    # Test products
    success, products = tester.test_get_products()
    if not success:
        print("❌ Failed to get products")
        return 1

    # Test product CRUD
    product_id = tester.test_create_product()
    if product_id:
        tester.test_update_product(product_id)
        
        # Test order creation with this product
        tester.test_create_order(product_id)
        
        # Test stock update
        tester.test_update_stock(product_id)
        
        # Delete the test product at the end
        tester.test_delete_product(product_id)

    # Test customer creation
    tester.test_create_customer()

    # Test reports
    tester.test_get_reports()

    # Print final results
    print("\n" + "=" * 50)
    print("FINAL TEST RESULTS")
    print("=" * 50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Print individual test results
    print("\nDetailed Results:")
    for result in tester.test_results:
        status_icon = "✅" if result["status"] == "PASS" else "❌"
        print(f"{status_icon} {result['test']}: {result['details']}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())