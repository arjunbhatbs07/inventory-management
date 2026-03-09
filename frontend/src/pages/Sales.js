import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, X, User, Phone, MapPin, Package } from 'lucide-react';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data.filter(p => p.stock > 0));
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handlePhoneChange = async (phone) => {
    setCustomerData({ ...customerData, phone });
    
    if (phone.length >= 10) {
      try {
        const response = await api.getCustomerByPhone(phone);
        if (response.data) {
          setCustomerData({
            name: response.data.name,
            phone: response.data.phone,
            address: response.data.address || ''
          });
          toast.success('Customer found!');
        }
      } catch (error) {}
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      product_id: '',
      product_name: '',
      quantity: '',
      buying_price: 0,
      selling_price: 0,
      unit: 'kg'
    }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].buying_price = product.buying_price;
        newItems[index].selling_price = product.selling_price;
        newItems[index].unit = product.unit;
      }
    }

    setOrderItems(newItems);
  };

  const calculateTotals = () => {
    const totalCostPrice = orderItems.reduce((sum, item) => 
      sum + (parseFloat(item.buying_price) || 0) * (parseFloat(item.quantity) || 0), 0);
    
    const totalRevenue = orderItems.reduce((sum, item) => 
      sum + (parseFloat(item.selling_price) || 0) * (parseFloat(item.quantity) || 0), 0);
    
    const netProfit = totalRevenue - totalCostPrice;

    return { totalCostPrice, totalRevenue, netProfit };
  };

  /* ===========================
     NEW FUNCTION FOR INVOICE
     =========================== */

  const downloadInvoice = async (orderId) => {
    try {
      const response = await fetch(
        `https://inventory-management-exvi.onrender.com/api/orders/${orderId}/invoice`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      a.click();
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    if (!customerData.name || !customerData.phone) {
      toast.error('Please fill in customer details');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: parseFloat(item.quantity),
          buying_price: parseFloat(item.buying_price),
          selling_price: parseFloat(item.selling_price),
          unit: item.unit
        }))
      };

      const response = await api.createOrder(orderData);

      toast.success('Order created successfully!');

      /* ===== DOWNLOAD INVOICE ===== */
      if (response?.data?.id) {
        downloadInvoice(response.data.id);
      }

      setOrderItems([]);
      setCustomerData({ name: '', phone: '', address: '' });

      loadProducts();

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="sales-title">Create Sale Order</h1>
        <p className="text-stone-600">Enter order details and customer information</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Customer phone"
                    value={customerData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    required
                    className="h-12 pl-10"
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Customer name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  required
                  className="h-12"
                  data-testid="input-customer-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <Textarea
                  id="address"
                  placeholder="Full delivery address..."
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  rows={2}
                  className="pl-10"
                  data-testid="input-customer-address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <Button
                type="button"
                onClick={addOrderItem}
                className="gap-2 active:scale-95"
                data-testid="add-item-button"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-stone-600">
                <Package className="h-12 w-12 mx-auto mb-3 text-stone-400" />
                <p>No items added yet</p>
                <p className="text-sm mt-1">Click "Add Item" to start</p>
              </div>
            ) : (
              orderItems.map((item, index) => (
                <div key={index} className="p-4 bg-stone-50 rounded-xl space-y-3" data-testid={`order-item-${index}`}>
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-stone-800">Item #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`remove-item-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Product *</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                        required
                      >
                        <SelectTrigger className="h-12" data-testid={`select-product-${index}`}>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ₹{product.selling_price}/{product.unit} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                        required
                        min="0.01"
                        className="h-12"
                        data-testid={`input-quantity-${index}`}
                      />
                    </div>
                  </div>

                  {item.product_id && item.quantity && (
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-stone-200">
                      <div>
                        <span className="text-stone-600">Cost: </span>
                        <span className="font-medium">₹{(item.buying_price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-stone-600">Revenue: </span>
                        <span className="font-medium text-emerald-600">₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-stone-600">Total Cost Price:</span>
                <span className="font-semibold">₹{totals.totalCostPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-stone-600">Total Revenue:</span>
                <span className="font-semibold text-emerald-600">₹{totals.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t-2 border-primary/20">
                <div className="flex justify-between text-xl">
                  <span className="font-semibold text-stone-800">Net Profit:</span>
                  <span className={`font-bold ${totals.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} data-testid="net-profit">
                    ₹{totals.netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-xl active:scale-95"
          disabled={loading || orderItems.length === 0}
          data-testid="create-order-button"
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </form>
    </div>
  );
};

export default Sales;
