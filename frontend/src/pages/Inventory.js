import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Minus, History, TrendingUp } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAction, setStockAction] = useState('add');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, historyRes, valueRes] = await Promise.all([
        api.getProducts(),
        api.getStockHistory(),
        api.getInventoryValue()
      ]);
      setProducts(productsRes.data);
      setStockHistory(historyRes.data);
      setInventoryValue(valueRes.data.inventory_value);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setStockAction('add');
    setDialogOpen(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await api.updateStock({
        product_id: selectedProduct.id,
        quantity: parseFloat(quantity),
        action: stockAction
      });
      toast.success('Stock updated successfully');
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="inventory-title">Inventory Management</h1>
        <p className="text-stone-600">Track and manage your product stock levels</p>
      </div>

      {/* Inventory Value Card */}
      <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 mb-1">Total Inventory Value</p>
              <p className="text-4xl font-bold text-primary" data-testid="inventory-value">₹{inventoryValue.toFixed(2)}</p>
              <p className="text-sm text-stone-600 mt-1">Based on buying prices</p>
            </div>
            <div className="bg-primary/20 text-primary p-4 rounded-2xl">
              <TrendingUp className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  product.stock <= product.min_stock
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-stone-50 border-stone-100'
                }`}
                data-testid={`inventory-item-${product.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-stone-800">{product.name}</h3>
                    {product.stock <= product.min_stock && (
                      <span className="low-stock-badge">Low Stock</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 mt-1">{product.category}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      product.stock <= product.min_stock ? 'text-red-600' : 'text-stone-800'
                    }`}>
                      {product.stock}
                    </p>
                    <p className="text-sm text-stone-600">{product.unit}</p>
                  </div>
                  <Button
                    onClick={() => handleOpenDialog(product)}
                    className="h-12 px-6 rounded-xl gap-2 active:scale-95"
                    data-testid={`update-stock-${product.id}`}
                  >
                    <History className="h-4 w-4" />
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock History */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          {stockHistory.length === 0 ? (
            <div className="text-center py-8 text-stone-600">
              <History className="h-12 w-12 mx-auto mb-3 text-stone-400" />
              <p>No stock movements yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stockHistory.slice(0, 20).map((history, index) => (
                <div
                  key={history.id || index}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                  data-testid={`history-item-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      history.quantity > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {history.quantity > 0 ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{history.product_name}</p>
                      <p className="text-sm text-stone-600">{history.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      history.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {history.quantity > 0 ? '+' : ''}{history.quantity}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(history.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="update-stock-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl">Update Stock - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={stockAction} onValueChange={setStockAction}>
                <SelectTrigger className="h-12" data-testid="select-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-emerald-600" />
                      Add Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="reduce">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Reduce Stock
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity ({selectedProduct?.unit})</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0.01"
                data-testid="input-quantity"
                className="h-12"
              />
            </div>

            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">Current Stock:</span>
                <span className="font-semibold">{selectedProduct?.stock} {selectedProduct?.unit}</span>
              </div>
              {quantity && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">New Stock:</span>
                  <span className="font-semibold text-primary">
                    {stockAction === 'add'
                      ? (parseFloat(selectedProduct?.stock) + parseFloat(quantity)).toFixed(2)
                      : (parseFloat(selectedProduct?.stock) - parseFloat(quantity)).toFixed(2)}
                    {' '}{selectedProduct?.unit}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="active:scale-95" data-testid="confirm-update-button">
                Update Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
