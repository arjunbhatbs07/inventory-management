import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, ShoppingCart, AlertTriangle, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-stone-600">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats?.today_revenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: "Today's Orders",
      value: stats?.today_orders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: "Today's Profit",
      value: `₹${stats?.today_profit?.toFixed(2) || 0}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Stock Value',
      value: `₹${stats?.total_stock_value?.toFixed(2) || 0}`,
      icon: CreditCard,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Low Stock Items',
      value: stats?.low_stock_count || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-stone-800 mb-2" data-testid="dashboard-title">Dashboard</h1>
        <p className="text-stone-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card" data-testid={`stat-card-${stat.title.toLowerCase().replace(/['\s]/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-stone-800">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Sales Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.sales_chart_data || []}>
              <XAxis dataKey="date" stroke="#808B96" />
              <YAxis stroke="#808B96" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#D35400" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {stats?.low_stock_products && stats.low_stock_products.length > 0 && (
        <Card className="stat-card border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.low_stock_products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
                  data-testid={`low-stock-${product.id}`}
                >
                  <div>
                    <p className="font-medium text-stone-800">{product.name}</p>
                    <p className="text-sm text-stone-600">
                      Stock: {product.stock} {product.unit} (Min: {product.min_stock})
                    </p>
                  </div>
                  <Link to="/inventory">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all">
                      Restock
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{order.customer_name}</p>
                    <p className="text-sm text-stone-600">
                      {order.items.length} item(s) • {order.customer_phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">₹{order.total_revenue.toFixed(2)}</p>
                    <p className="text-sm text-stone-600">
                      Profit: ₹{order.net_profit.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-600">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-stone-400" />
              <p>No orders yet today!</p>
              <p className="text-sm mt-1">Time to sell some delicious products!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
