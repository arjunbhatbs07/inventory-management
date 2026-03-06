import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Search, Users, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadCustomers(searchTerm);
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const loadCustomers = async (search = '') => {
    try {
      const response = await api.getCustomers(search);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      setSelectedCustomer(customer);
      const response = await api.getCustomerOrders(customer.id);
      setCustomerOrders(response.data);
      setDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load customer orders');
    }
  };

  const calculateCustomerStats = (orders) => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_revenue, 0);
    return { totalOrders, totalSpent };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="customers-title">Customers</h1>
        <p className="text-stone-600">Manage your customer relationships</p>
      </div>

      {/* Search */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <Input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-10"
              data-testid="search-customers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      {customers.length === 0 ? (
        <Card className="stat-card">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-stone-400" />
            <p className="text-lg text-stone-600 mb-2">No customers found</p>
            <p className="text-sm text-stone-500">
              {searchTerm ? 'Try a different search term' : 'Customers will appear here after their first order'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="stat-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewCustomer(customer)}
              data-testid={`customer-card-${customer.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-stone-800">{customer.name}</h3>
                      <p className="text-sm text-stone-500">
                        Since {new Date(customer.date_added).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-stone-600">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCustomer(customer);
                  }}
                  data-testid={`view-customer-${customer.id}`}
                >
                  View Order History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="customer-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl">Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-2">
                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Phone className="h-4 w-4" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2 text-sm text-stone-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {calculateCustomerStats(customerOrders).totalOrders}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-emerald-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    ₹{calculateCustomerStats(customerOrders).totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Order History</h4>
                {customerOrders.length === 0 ? (
                  <div className="text-center py-8 text-stone-600">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-stone-400" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order, index) => (
                      <div
                        key={order.id}
                        className="p-4 bg-stone-50 rounded-xl"
                        data-testid={`order-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-stone-800">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-stone-600">
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ₹{order.total_revenue.toFixed(2)}
                            </p>
                            <p className="text-sm text-stone-600">
                              Profit: ₹{order.net_profit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-stone-600">
                          {order.items.map((item, i) => (
                            <span key={i}>
                              {item.product_name} ({item.quantity} {item.unit})
                              {i < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
