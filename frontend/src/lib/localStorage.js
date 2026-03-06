// Local Storage Service
const STORAGE_KEYS = {
  PRODUCTS: 'pickle_profit_products',
  CUSTOMERS: 'pickle_profit_customers',
  ORDERS: 'pickle_profit_orders',
  STOCK_HISTORY: 'pickle_profit_stock_history',
  USER: 'pickle_profit_user',
  IS_INITIALIZED: 'pickle_profit_initialized'
};

// Initial products data with stock = 0
const INITIAL_PRODUCTS = [
  {id: '1', name: 'Potato Chips Plain', category: 'Chips', selling_price: 460, buying_price: 320, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Potato Chips Plain', image_url: null, date_added: new Date().toISOString()},
  {id: '2', name: 'Potato Chips Chilli', category: 'Chips', selling_price: 460, buying_price: 320, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Potato Chips Chilli', image_url: null, date_added: new Date().toISOString()},
  {id: '3', name: 'Potato Chips Pudina', category: 'Chips', selling_price: 460, buying_price: 320, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Potato Chips Pudina', image_url: null, date_added: new Date().toISOString()},
  {id: '4', name: 'Banana Chips Plain', category: 'Chips', selling_price: 420, buying_price: 295, stock: 0, min_stock: 5, unit: 'kg', description: 'Delicious homemade Banana Chips Plain', image_url: null, date_added: new Date().toISOString()},
  {id: '5', name: 'Banana Chips Chilli', category: 'Chips', selling_price: 420, buying_price: 295, stock: 0, min_stock: 5, unit: 'kg', description: 'Delicious homemade Banana Chips Chilli', image_url: null, date_added: new Date().toISOString()},
  {id: '6', name: 'Banana Chips Pepper', category: 'Chips', selling_price: 420, buying_price: 295, stock: 0, min_stock: 4, unit: 'kg', description: 'Delicious homemade Banana Chips Pepper', image_url: null, date_added: new Date().toISOString()},
  {id: '7', name: 'Banana Chips Tomato', category: 'Chips', selling_price: 420, buying_price: 295, stock: 0, min_stock: 4, unit: 'kg', description: 'Delicious homemade Banana Chips Tomato', image_url: null, date_added: new Date().toISOString()},
  {id: '8', name: 'Banana Chips Coconut Oil', category: 'Chips', selling_price: 480, buying_price: 340, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Banana Chips Coconut Oil', image_url: null, date_added: new Date().toISOString()},
  {id: '9', name: 'Jackfruit Chips Coconut Oil', category: 'Chips', selling_price: 650, buying_price: 460, stock: 0, min_stock: 2, unit: 'kg', description: 'Delicious homemade Jackfruit Chips Coconut Oil', image_url: null, date_added: new Date().toISOString()},
  {id: '10', name: 'Jackfruit Chips Sunflower Oil', category: 'Chips', selling_price: 580, buying_price: 410, stock: 0, min_stock: 2, unit: 'kg', description: 'Delicious homemade Jackfruit Chips Sunflower Oil', image_url: null, date_added: new Date().toISOString()},
  {id: '11', name: 'Garlic Mini Papad', category: 'Papad', selling_price: 500, buying_price: 350, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Garlic Mini Papad', image_url: null, date_added: new Date().toISOString()},
  {id: '12', name: 'Onion Mini Papad', category: 'Papad', selling_price: 500, buying_price: 350, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Onion Mini Papad', image_url: null, date_added: new Date().toISOString()},
  {id: '13', name: 'Traditional Uddina Papad', category: 'Papad', selling_price: 130, buying_price: 90, stock: 0, min_stock: 50, unit: 'pieces', description: '50 pieces pack', image_url: null, date_added: new Date().toISOString()},
  {id: '14', name: 'Traditional Uddina Chilli Papad', category: 'Papad', selling_price: 130, buying_price: 90, stock: 0, min_stock: 50, unit: 'pieces', description: '50 pieces pack', image_url: null, date_added: new Date().toISOString()},
  {id: '15', name: 'Potato Papad', category: 'Papad', selling_price: 90, buying_price: 65, stock: 0, min_stock: 40, unit: 'pieces', description: '20 pieces pack', image_url: null, date_added: new Date().toISOString()},
  {id: '16', name: 'Masala Peanuts', category: 'Snacks', selling_price: 400, buying_price: 280, stock: 0, min_stock: 4, unit: 'kg', description: 'Delicious homemade Masala Peanuts', image_url: null, date_added: new Date().toISOString()},
  {id: '17', name: 'Garlic Mixture', category: 'Snacks', selling_price: 400, buying_price: 280, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Garlic Mixture', image_url: null, date_added: new Date().toISOString()},
  {id: '18', name: 'Plain Sev', category: 'Snacks', selling_price: 380, buying_price: 270, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Plain Sev', image_url: null, date_added: new Date().toISOString()},
  {id: '19', name: 'Kod Bale', category: 'Snacks', selling_price: 400, buying_price: 280, stock: 0, min_stock: 3, unit: 'kg', description: 'Delicious homemade Kod Bale', image_url: null, date_added: new Date().toISOString()},
  {id: '20', name: 'Rasam Powder', category: 'Powders', selling_price: 600, buying_price: 420, stock: 0, min_stock: 2, unit: 'kg', description: 'Delicious homemade Rasam Powder', image_url: null, date_added: new Date().toISOString()},
  {id: '21', name: 'Chutney Powder', category: 'Powders', selling_price: 600, buying_price: 420, stock: 0, min_stock: 2, unit: 'kg', description: 'Delicious homemade Chutney Powder', image_url: null, date_added: new Date().toISOString()},
  {id: '22', name: 'Sambar Powder', category: 'Powders', selling_price: 600, buying_price: 420, stock: 0, min_stock: 2, unit: 'kg', description: 'Delicious homemade Sambar Powder', image_url: null, date_added: new Date().toISOString()},
  {id: '23', name: 'Papad Combo', category: 'Combo', selling_price: 350, buying_price: 250, stock: 0, min_stock: 5, unit: 'combo', description: 'Delicious homemade Papad Combo', image_url: null, date_added: new Date().toISOString()},
  {id: '24', name: 'Kokum Squash', category: 'Beverages', selling_price: 130, buying_price: 95, stock: 0, min_stock: 3, unit: 'litre', description: 'Coming Soon', image_url: null, date_added: new Date().toISOString()}
];

class LocalStorageService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.STOCK_HISTORY, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
    }
  }

  // Auth
  login(username, password) {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) {
      const userData = JSON.parse(user);
      if (userData.username === username && userData.password === password) {
        return { user: { username: userData.username, full_name: userData.full_name } };
      }
    }
    throw new Error('Invalid credentials');
  }

  register(username, password, full_name) {
    const user = { username, password, full_name };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user: { username, full_name } };
  }

  // Products
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }

  getProduct(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  createProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      date_added: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  }

  updateProduct(id, productData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
    }
    throw new Error('Product not found');
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  }

  // Customers
  getCustomers(search = '') {
    const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
    if (search) {
      return customers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      );
    }
    return customers;
  }

  getCustomerByPhone(phone) {
    const customers = this.getCustomers();
    return customers.find(c => c.phone === phone) || null;
  }

  createCustomer(customerData) {
    const customers = this.getCustomers();
    const newCustomer = {
      ...customerData,
      id: Date.now().toString(),
      date_added: new Date().toISOString()
    };
    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return newCustomer;
  }

  // Orders
  createOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    
    // Calculate totals (NO EXTRA EXPENSES)
    const totalCostPrice = orderData.items.reduce((sum, item) => 
      sum + (item.buying_price * item.quantity), 0);
    const totalRevenue = orderData.items.reduce((sum, item) => 
      sum + (item.selling_price * item.quantity), 0);
    const netProfit = totalRevenue - totalCostPrice;

    // Create or update customer
    let customerId = orderData.customer_id;
    if (!customerId) {
      const existingCustomer = this.getCustomerByPhone(orderData.customer_phone);
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer = this.createCustomer({
          name: orderData.customer_name,
          phone: orderData.customer_phone,
          address: orderData.customer_address
        });
        customerId = newCustomer.id;
      }
    }

    const newOrder = {
      id: Date.now().toString(),
      customer_id: customerId,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
      items: orderData.items,
      total_cost_price: totalCostPrice,
      total_revenue: totalRevenue,
      net_profit: netProfit,
      date: new Date().toISOString()
    };

    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Update stock and history
    orderData.items.forEach(item => {
      this.updateStock(item.product_id, -item.quantity, 'Sale');
    });

    return newOrder;
  }

  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  getCustomerOrders(customerId) {
    const orders = this.getOrders();
    return orders.filter(o => o.customer_id === customerId);
  }

  // Stock Management
  updateStock(productId, quantityChange, action) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      product.stock = Math.max(0, product.stock + quantityChange);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Add to history
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_HISTORY) || '[]');
      history.push({
        id: Date.now().toString(),
        product_id: productId,
        product_name: product.name,
        action: action,
        quantity: quantityChange,
        date: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.STOCK_HISTORY, JSON.stringify(history));
    }
  }

  getStockHistory(productId = null) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_HISTORY) || '[]');
    if (productId) {
      return history.filter(h => h.product_id === productId);
    }
    return history;
  }

  getInventoryValue() {
    const products = this.getProducts();
    return products.reduce((sum, p) => sum + (p.stock * p.buying_price), 0);
  }

  // Dashboard
  getDashboardStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(o => new Date(o.date) >= today);
    
    const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
    
    // Sales chart (last 7 days)
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= date && orderDate < nextDate;
      });
      
      salesChartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total_revenue, 0)
      });
    }

    return {
      total_products: products.length,
      total_stock_value: this.getInventoryValue(),
      today_orders: todayOrders.length,
      today_revenue: todayOrders.reduce((sum, o) => sum + o.total_revenue, 0),
      today_expenses: todayOrders.reduce((sum, o) => sum + o.total_cost_price, 0),
      today_profit: todayOrders.reduce((sum, o) => sum + o.net_profit, 0),
      low_stock_count: lowStockProducts.length,
      low_stock_products: lowStockProducts,
      recent_orders: orders.slice(-5).reverse(),
      sales_chart_data: salesChartData
    };
  }

  // Reports
  getSalesReport(period) {
    const orders = this.getOrders();
    let filteredOrders = orders;

    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredOrders = orders.filter(o => new Date(o.date) >= today);
    } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredOrders = orders.filter(o => new Date(o.date) >= weekAgo);
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      filteredOrders = orders.filter(o => new Date(o.date) >= monthAgo);
    }

    return {
      period,
      total_orders: filteredOrders.length,
      total_revenue: filteredOrders.reduce((sum, o) => sum + o.total_revenue, 0),
      total_cost: filteredOrders.reduce((sum, o) => sum + o.total_cost_price, 0),
      total_expenses: 0,
      total_profit: filteredOrders.reduce((sum, o) => sum + o.net_profit, 0),
      orders: filteredOrders
    };
  }

  getBestSellingProducts() {
    const orders = this.getOrders();
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            total_quantity: 0,
            total_revenue: 0
          };
        }
        productSales[item.product_id].total_quantity += item.quantity;
        productSales[item.product_id].total_revenue += item.selling_price * item.quantity;
      });
    });

    return Object.values(productSales).sort((a, b) => b.total_quantity - a.total_quantity);
  }

  exportCSV() {
    const orders = this.getOrders();
    const csvLines = ['Date,Customer Name,Customer Phone,Products,Quantity,Revenue,Cost,Profit'];

    orders.forEach(order => {
      const date = new Date(order.date).toLocaleDateString();
      const products = order.items.map(i => `${i.product_name} (${i.quantity} ${i.unit})`).join('; ');
      const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
      
      csvLines.push(
        `${date},${order.customer_name},${order.customer_phone},"${products}",${totalQty},${order.total_revenue},${order.total_cost_price},${order.net_profit}`
      );
    });

    return {
      csv_data: csvLines.join('\n'),
      filename: `sales_report_${new Date().toISOString().split('T')[0]}.csv`
    };
  }
}

export const storageService = new LocalStorageService();
