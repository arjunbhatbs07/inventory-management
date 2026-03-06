import { storageService } from './localStorage';

// Wrap localStorage service to return promises (for compatibility with existing code)
const promisify = (fn) => (...args) => Promise.resolve(fn(...args));

export const api = {
  // Dashboard
  getDashboard: promisify(() => ({ data: storageService.getDashboardStats() })),

  // Products
  getProducts: promisify(() => ({ data: storageService.getProducts() })),
  getProduct: promisify((id) => ({ data: storageService.getProduct(id) })),
  createProduct: promisify((data) => ({ data: storageService.createProduct(data) })),
  updateProduct: promisify((id, data) => ({ data: storageService.updateProduct(id, data) })),
  deleteProduct: promisify((id) => { storageService.deleteProduct(id); return { data: { message: 'Deleted' } }; }),

  // Customers
  getCustomers: promisify((search) => ({ data: storageService.getCustomers(search) })),
  getCustomer: promisify((id) => ({ data: storageService.getCustomers().find(c => c.id === id) })),
  createCustomer: promisify((data) => ({ data: storageService.createCustomer(data) })),
  getCustomerByPhone: promisify((phone) => ({ data: storageService.getCustomerByPhone(phone) })),
  getCustomerOrders: promisify((customerId) => ({ data: storageService.getCustomerOrders(customerId) })),

  // Orders
  createOrder: promisify((data) => ({ data: storageService.createOrder(data) })),
  getOrders: promisify(() => ({ data: storageService.getOrders() })),

  // Inventory
  updateStock: promisify((data) => {
    storageService.updateStock(data.product_id, data.action === 'add' ? data.quantity : -data.quantity, data.action === 'add' ? 'Add Stock' : 'Reduce Stock');
    return { data: { message: 'Updated' } };
  }),
  getStockHistory: promisify((productId) => ({ data: storageService.getStockHistory(productId) })),
  getInventoryValue: promisify(() => ({ data: { inventory_value: storageService.getInventoryValue() } })),

  // Reports
  getSalesReport: promisify((period) => ({ data: storageService.getSalesReport(period) })),
  getBestSellingProducts: promisify(() => ({ data: storageService.getBestSellingProducts() })),
  exportCSV: promisify(() => ({ data: storageService.exportCSV() }))
};
