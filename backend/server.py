from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hashlib
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    category: str
    image_url: Optional[str] = None
    buying_price: float
    selling_price: float
    stock: float
    min_stock: float
    description: Optional[str] = None
    unit: str = "kg"  # kg, pieces, litre, combo
    date_added: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    image_url: Optional[str] = None
    buying_price: float
    selling_price: float
    stock: float
    min_stock: float
    description: Optional[str] = None
    unit: str = "kg"

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    address: Optional[str] = None
    date_added: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    buying_price: float
    selling_price: float
    unit: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[OrderItem]
    courier_charges: float = 0
    packing_charges: float = 0
    gum_tape_cost: float = 0
    box_cost: float = 0
    total_cost_price: float
    total_revenue: float
    total_extra_expenses: float
    net_profit: float
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[OrderItem]
    courier_charges: float = 0
    packing_charges: float = 0
    gum_tape_cost: float = 0
    box_cost: float = 0

class StockUpdate(BaseModel):
    product_id: str
    quantity: float
    action: str  # "add" or "reduce"

class StockHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    product_id: str
    product_name: str
    action: str
    quantity: float
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    total_products: int
    total_stock_value: float
    today_orders: int
    today_revenue: float
    today_expenses: float
    today_profit: float
    low_stock_count: int
    low_stock_products: List[Product]
    recent_orders: List[Order]
    sales_chart_data: List[Dict[str, Any]]

# ==================== AUTH HELPERS ====================

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
    
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"username": username}, {"_id": 0})
    if user_doc is None:
        raise credentials_exception
    return User(**user_doc)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "username": user_data.username,
        "full_name": user_data.full_name,
        "password_hash": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user_data.username})
    user = User(username=user_data.username, full_name=user_data.full_name)
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({"username": user_data.username})
    if not user_doc or not verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user_data.username})
    user = User(username=user_doc["username"], full_name=user_doc.get("full_name"))
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    import uuid
    product_dict = product_data.model_dump()
    product_dict["id"] = str(uuid.uuid4())
    product_dict["date_added"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.insert_one(product_dict)
    return Product(**product_dict)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    product_dict = product_data.model_dump()
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ==================== CUSTOMER ROUTES ====================

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(search: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if search:
        query = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]}
    customers = await db.customers.find(query, {"_id": 0}).to_list(1000)
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    import uuid
    customer_dict = customer_data.model_dump()
    customer_dict["id"] = str(uuid.uuid4())
    customer_dict["date_added"] = datetime.now(timezone.utc).isoformat()
    
    await db.customers.insert_one(customer_dict)
    return Customer(**customer_dict)

@api_router.get("/customers/phone/{phone}", response_model=Optional[Customer])
async def get_customer_by_phone(phone: str, current_user: User = Depends(get_current_user)):
    customer = await db.customers.find_one({"phone": phone}, {"_id": 0})
    if not customer:
        return None
    return Customer(**customer)

# ==================== ORDER/SALES ROUTES ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    import uuid
    
    # Calculate totals
    total_cost_price = sum(item.buying_price * item.quantity for item in order_data.items)
    total_revenue = sum(item.selling_price * item.quantity for item in order_data.items)
    total_extra_expenses = order_data.courier_charges + order_data.packing_charges + order_data.gum_tape_cost + order_data.box_cost
    net_profit = total_revenue - total_cost_price - total_extra_expenses
    
    # Create or update customer
    customer_id = order_data.customer_id
    if not customer_id:
        existing_customer = await db.customers.find_one({"phone": order_data.customer_phone}, {"_id": 0})
        if existing_customer:
            customer_id = existing_customer["id"]
        else:
            customer_id = str(uuid.uuid4())
            customer_dict = {
                "id": customer_id,
                "name": order_data.customer_name,
                "phone": order_data.customer_phone,
                "address": order_data.customer_address,
                "date_added": datetime.now(timezone.utc).isoformat()
            }
            await db.customers.insert_one(customer_dict)
    
    # Create order
    order_dict = {
        "id": str(uuid.uuid4()),
        "customer_id": customer_id,
        "customer_name": order_data.customer_name,
        "customer_phone": order_data.customer_phone,
        "customer_address": order_data.customer_address,
        "items": [item.model_dump() for item in order_data.items],
        "courier_charges": order_data.courier_charges,
        "packing_charges": order_data.packing_charges,
        "gum_tape_cost": order_data.gum_tape_cost,
        "box_cost": order_data.box_cost,
        "total_cost_price": total_cost_price,
        "total_revenue": total_revenue,
        "total_extra_expenses": total_extra_expenses,
        "net_profit": net_profit,
        "date": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_dict)
    
    # Update product stock and create stock history
    for item in order_data.items:
        # Reduce stock
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
        
        # Add stock history
        history_dict = {
            "id": str(uuid.uuid4()),
            "product_id": item.product_id,
            "product_name": item.product_name,
            "action": "Sale",
            "quantity": -item.quantity,
            "date": datetime.now(timezone.utc).isoformat()
        }
        await db.stock_history.insert_one(history_dict)
    
    return Order(**order_dict)

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if start_date and end_date:
        query["date"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    orders = await db.orders.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return orders

@api_router.get("/orders/customer/{customer_id}", response_model=List[Order])
async def get_customer_orders(customer_id: str, current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"customer_id": customer_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    return orders

# ==================== INVENTORY ROUTES ====================

@api_router.post("/inventory/update-stock")
async def update_stock(stock_data: StockUpdate, current_user: User = Depends(get_current_user)):
    import uuid
    
    product = await db.products.find_one({"id": stock_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    quantity_change = stock_data.quantity if stock_data.action == "add" else -stock_data.quantity
    
    # Update stock
    await db.products.update_one(
        {"id": stock_data.product_id},
        {"$inc": {"stock": quantity_change}}
    )
    
    # Add stock history
    history_dict = {
        "id": str(uuid.uuid4()),
        "product_id": stock_data.product_id,
        "product_name": product["name"],
        "action": "Add Stock" if stock_data.action == "add" else "Reduce Stock",
        "quantity": quantity_change,
        "date": datetime.now(timezone.utc).isoformat()
    }
    await db.stock_history.insert_one(history_dict)
    
    return {"message": "Stock updated successfully"}

@api_router.get("/inventory/history", response_model=List[StockHistory])
async def get_stock_history(product_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if product_id:
        query["product_id"] = product_id
    history = await db.stock_history.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return history

@api_router.get("/inventory/value")
async def get_inventory_value(current_user: User = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    total_value = sum(p["stock"] * p["buying_price"] for p in products)
    return {"inventory_value": total_value}

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    # Get all products
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    total_products = len(products)
    total_stock_value = sum(p["stock"] * p["buying_price"] for p in products)
    
    # Low stock products
    low_stock_products = [Product(**p) for p in products if p["stock"] <= p["min_stock"]]
    low_stock_count = len(low_stock_products)
    
    # Today's orders
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.orders.find(
        {"date": {"$gte": today_start.isoformat()}},
        {"_id": 0}
    ).to_list(1000)
    
    today_revenue = sum(o["total_revenue"] for o in today_orders)
    today_expenses = sum(o["total_cost_price"] + o["total_extra_expenses"] for o in today_orders)
    today_profit = sum(o["net_profit"] for o in today_orders)
    
    # Recent orders (last 5)
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("date", -1).limit(5).to_list(5)
    
    # Sales chart data (last 7 days)
    sales_chart_data = []
    for i in range(6, -1, -1):
        day_start = (datetime.now(timezone.utc) - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_orders = await db.orders.find(
            {"date": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}},
            {"_id": 0}
        ).to_list(1000)
        
        day_revenue = sum(o["total_revenue"] for o in day_orders)
        sales_chart_data.append({
            "date": day_start.strftime("%a"),
            "revenue": day_revenue
        })
    
    return DashboardStats(
        total_products=total_products,
        total_stock_value=total_stock_value,
        today_orders=len(today_orders),
        today_revenue=today_revenue,
        today_expenses=today_expenses,
        today_profit=today_profit,
        low_stock_count=low_stock_count,
        low_stock_products=low_stock_products,
        recent_orders=[Order(**o) for o in recent_orders],
        sales_chart_data=sales_chart_data
    )

# ==================== REPORTS ROUTES ====================

@api_router.get("/reports/sales")
async def get_sales_report(
    period: str = "daily",  # daily, weekly, monthly
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif period == "daily":
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        query["date"] = {"$gte": today_start.isoformat()}
    elif period == "weekly":
        week_start = datetime.now(timezone.utc) - timedelta(days=7)
        query["date"] = {"$gte": week_start.isoformat()}
    elif period == "monthly":
        month_start = datetime.now(timezone.utc) - timedelta(days=30)
        query["date"] = {"$gte": month_start.isoformat()}
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(o["total_revenue"] for o in orders)
    total_cost = sum(o["total_cost_price"] for o in orders)
    total_expenses = sum(o["total_extra_expenses"] for o in orders)
    total_profit = sum(o["net_profit"] for o in orders)
    
    return {
        "period": period,
        "total_orders": len(orders),
        "total_revenue": total_revenue,
        "total_cost": total_cost,
        "total_expenses": total_expenses,
        "total_profit": total_profit,
        "orders": orders
    }

@api_router.get("/reports/best-selling")
async def get_best_selling_products(current_user: User = Depends(get_current_user)):
    # Get all orders
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    # Count product sales
    product_sales = {}
    for order in orders:
        for item in order["items"]:
            if item["product_id"] not in product_sales:
                product_sales[item["product_id"]] = {
                    "product_id": item["product_id"],
                    "product_name": item["product_name"],
                    "total_quantity": 0,
                    "total_revenue": 0
                }
            product_sales[item["product_id"]]["total_quantity"] += item["quantity"]
            product_sales[item["product_id"]]["total_revenue"] += item["selling_price"] * item["quantity"]
    
    # Sort by quantity
    best_selling = sorted(product_sales.values(), key=lambda x: x["total_quantity"], reverse=True)
    
    return best_selling

@api_router.get("/reports/export-csv")
async def export_sales_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    
    # Create CSV data
    csv_lines = ["Date,Customer Name,Customer Phone,Products,Quantity,Revenue,Cost,Expenses,Profit"]
    
    for order in orders:
        date_str = order["date"][:10] if isinstance(order["date"], str) else order["date"].strftime("%Y-%m-%d")
        products = "; ".join([f"{item['product_name']} ({item['quantity']} {item['unit']})" for item in order["items"]])
        total_qty = sum(item["quantity"] for item in order["items"])
        
        csv_lines.append(
            f"{date_str},{order['customer_name']},{order['customer_phone']},\"{products}\",{total_qty},{order['total_revenue']},{order['total_cost_price']},{order['total_extra_expenses']},{order['net_profit']}"
        )
    
    csv_content = "\n".join(csv_lines)
    
    return {
        "csv_data": csv_content,
        "filename": f"sales_report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    }

# ==================== SEED DATA ====================

@api_router.post("/seed-data")
async def seed_initial_data():
    # Check if already seeded
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Data already exists"}
    
    import uuid
    
    # Initial products from user's data
    initial_products = [
        {"name": "Potato Chips Plain", "category": "Chips", "selling_price": 460, "buying_price": 320, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Potato Chips Chilli", "category": "Chips", "selling_price": 460, "buying_price": 320, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Potato Chips Pudina", "category": "Chips", "selling_price": 460, "buying_price": 320, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Banana Chips Plain", "category": "Chips", "selling_price": 420, "buying_price": 295, "stock": 15, "min_stock": 5, "unit": "kg"},
        {"name": "Banana Chips Chilli", "category": "Chips", "selling_price": 420, "buying_price": 295, "stock": 15, "min_stock": 5, "unit": "kg"},
        {"name": "Banana Chips Pepper", "category": "Chips", "selling_price": 420, "buying_price": 295, "stock": 12, "min_stock": 4, "unit": "kg"},
        {"name": "Banana Chips Tomato", "category": "Chips", "selling_price": 420, "buying_price": 295, "stock": 12, "min_stock": 4, "unit": "kg"},
        {"name": "Banana Chips Coconut Oil", "category": "Chips", "selling_price": 480, "buying_price": 340, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Jackfruit Chips Coconut Oil", "category": "Chips", "selling_price": 650, "buying_price": 460, "stock": 5, "min_stock": 2, "unit": "kg"},
        {"name": "Jackfruit Chips Sunflower Oil", "category": "Chips", "selling_price": 580, "buying_price": 410, "stock": 5, "min_stock": 2, "unit": "kg"},
        {"name": "Garlic Mini Papad", "category": "Papad", "selling_price": 500, "buying_price": 350, "stock": 8, "min_stock": 3, "unit": "kg"},
        {"name": "Onion Mini Papad", "category": "Papad", "selling_price": 500, "buying_price": 350, "stock": 8, "min_stock": 3, "unit": "kg"},
        {"name": "Traditional Uddina Papad", "category": "Papad", "selling_price": 130, "buying_price": 90, "stock": 200, "min_stock": 50, "unit": "pieces", "description": "50 pieces pack"},
        {"name": "Traditional Uddina Chilli Papad", "category": "Papad", "selling_price": 130, "buying_price": 90, "stock": 150, "min_stock": 50, "unit": "pieces", "description": "50 pieces pack"},
        {"name": "Potato Papad", "category": "Papad", "selling_price": 90, "buying_price": 65, "stock": 100, "min_stock": 40, "unit": "pieces", "description": "20 pieces pack"},
        {"name": "Masala Peanuts", "category": "Snacks", "selling_price": 400, "buying_price": 280, "stock": 12, "min_stock": 4, "unit": "kg"},
        {"name": "Garlic Mixture", "category": "Snacks", "selling_price": 400, "buying_price": 280, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Plain Sev", "category": "Snacks", "selling_price": 380, "buying_price": 270, "stock": 10, "min_stock": 3, "unit": "kg"},
        {"name": "Kod Bale", "category": "Snacks", "selling_price": 400, "buying_price": 280, "stock": 8, "min_stock": 3, "unit": "kg"},
        {"name": "Rasam Powder", "category": "Powders", "selling_price": 600, "buying_price": 420, "stock": 5, "min_stock": 2, "unit": "kg"},
        {"name": "Chutney Powder", "category": "Powders", "selling_price": 600, "buying_price": 420, "stock": 6, "min_stock": 2, "unit": "kg"},
        {"name": "Sambar Powder", "category": "Powders", "selling_price": 600, "buying_price": 420, "stock": 6, "min_stock": 2, "unit": "kg"},
        {"name": "Papad Combo", "category": "Combo", "selling_price": 350, "buying_price": 250, "stock": 15, "min_stock": 5, "unit": "combo"},
        {"name": "Kokum Squash", "category": "Beverages", "selling_price": 130, "buying_price": 95, "stock": 0, "min_stock": 3, "unit": "litre", "description": "Coming Soon"},
    ]
    
    for product in initial_products:
        product["id"] = str(uuid.uuid4())
        product["date_added"] = datetime.now(timezone.utc).isoformat()
        product["image_url"] = None
        if not product.get("description"):
            product["description"] = f"Delicious homemade {product['name']}"
        await db.products.insert_one(product)
    
    return {"message": f"Successfully seeded {len(initial_products)} products"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
