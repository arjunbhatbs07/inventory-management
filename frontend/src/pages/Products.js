import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    image_url: '',
    buying_price: '',
    selling_price: '',
    stock: '',
    min_stock: '',
    description: '',
    unit: 'kg'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        image_url: '',
        buying_price: '',
        selling_price: '',
        stock: '',
        min_stock: '',
        description: '',
        unit: 'kg'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        buying_price: parseFloat(formData.buying_price),
        selling_price: parseFloat(formData.selling_price),
        stock: parseFloat(formData.stock),
        min_stock: parseFloat(formData.min_stock)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(data);
        toast.success('Product created successfully');
      }
      
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await api.deleteProduct(productId);
        toast.success('Product deleted successfully');
        loadProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading products...</div>;
  }

  const profitPercentage = (buying, selling) => {
    if (!buying || !selling) return 0;
    return (((selling - buying) / buying) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="products-title">Products</h1>
          <p className="text-stone-600">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-12 px-6 rounded-xl gap-2 active:scale-95"
          data-testid="add-product-button"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="stat-card">
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-stone-400" />
            <p className="text-lg text-stone-600 mb-2">No products yet</p>
            <p className="text-sm text-stone-500 mb-4">Add your first product to get started</p>
            <Button onClick={() => handleOpenDialog()} data-testid="empty-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="product-card" data-testid={`product-card-${product.id}`}>
              <div className="aspect-square bg-stone-100 relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-stone-300" />
                  </div>
                )}
                {product.stock <= product.min_stock && (
                  <span className="absolute top-2 right-2 low-stock-badge">
                    Low Stock
                  </span>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-stone-800 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-stone-500">{product.category}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Selling Price:</span>
                    <span className="font-semibold text-stone-800">₹{product.selling_price}/{product.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Buying Price:</span>
                    <span className="text-stone-600">₹{product.buying_price}/{product.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Profit:</span>
                    <span className="text-emerald-600 font-medium">
                      {profitPercentage(product.buying_price, product.selling_price)}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-stone-600">Stock:</span>
                    <span className={`font-semibold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-stone-800'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(product)}
                      data-testid={`edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(product.id, product.name)}
                      data-testid={`delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-product-name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="h-12" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chips">Chips</SelectItem>
                    <SelectItem value="Papad">Papad</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Powders">Powders</SelectItem>
                    <SelectItem value="Combo">Combo</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  required
                >
                  <SelectTrigger className="h-12" data-testid="select-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="litre">Litre</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buying_price">Buying Price (₹) *</Label>
                <Input
                  id="buying_price"
                  type="number"
                  step="0.01"
                  value={formData.buying_price}
                  onChange={(e) => setFormData({ ...formData, buying_price: e.target.value })}
                  required
                  data-testid="input-buying-price"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price (₹) *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                  data-testid="input-selling-price"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  step="0.01"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  data-testid="input-stock"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock">Minimum Stock Level *</Label>
                <Input
                  id="min_stock"
                  type="number"
                  step="0.01"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  required
                  data-testid="input-min-stock"
                  className="h-12"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                  className="h-12"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  data-testid="input-description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button type="submit" className="active:scale-95" data-testid="save-product-button">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
