import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { FileText, Download, TrendingUp, Package } from 'lucide-react';

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [salesReport, setSalesReport] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [salesRes, bestRes] = await Promise.all([
        api.getSalesReport(period),
        api.getBestSellingProducts()
      ]);
      setSalesReport(salesRes.data);
      setBestSelling(bestRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.exportCSV();
      const blob = new Blob([response.data.csv_data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading && !salesReport) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="reports-title">Reports</h1>
          <p className="text-stone-600">Analyze your business performance</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="gap-2 h-12 px-6 rounded-xl active:scale-95"
          data-testid="export-csv-button"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-stone-700">Report Period:</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 h-10" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">Last 7 Days</SelectItem>
                <SelectItem value="monthly">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary */}
      {salesReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-stone-800" data-testid="total-orders">
                    {salesReport.total_orders}
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600" data-testid="total-revenue">
                    ₹{salesReport.total_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600" data-testid="total-expenses">
                    ₹{(salesReport.total_cost + salesReport.total_expenses).toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 text-red-600 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Net Profit</p>
                  <p className="text-3xl font-bold text-primary" data-testid="net-profit">
                    ₹{salesReport.total_profit.toFixed(2)}
                  </p>
                </div>
                <div className="bg-primary/20 text-primary p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best Selling Products */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestSelling.length === 0 ? (
            <div className="text-center py-8 text-stone-600">
              <Package className="h-12 w-12 mx-auto mb-3 text-stone-400" />
              <p>No sales data yet</p>
              <p className="text-sm mt-1">Start selling to see your best products!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bestSelling.slice(0, 10).map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                  data-testid={`best-selling-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800">{product.product_name}</h4>
                      <p className="text-sm text-stone-600">
                        {product.total_quantity.toFixed(2)} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      ₹{product.total_revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-stone-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {salesReport && salesReport.orders && salesReport.orders.length > 0 && (
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Recent Orders ({period})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesReport.orders.slice(0, 10).map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                  data-testid={`order-${index}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{order.customer_name}</p>
                    <p className="text-sm text-stone-600">
                      {new Date(order.date).toLocaleDateString()} • {order.items.length} item(s)
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
