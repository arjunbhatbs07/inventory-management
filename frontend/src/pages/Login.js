import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { UtensilsCrossed } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
    checkFirstTime();
  }, [navigate]);

  const checkFirstTime = async () => {
    try {
      const response = await api.getProducts();
      if (response.data.length === 0) {
        setFirstTime(true);
        setIsRegister(true);
      }
    } catch (error) {
      setFirstTime(true);
      setIsRegister(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register(formData.username, formData.password, formData.full_name);
        toast.success('Account created successfully! All products loaded with 0 stock.');
        
      } else {
        await authService.login(formData.username, formData.password);
        toast.success('Login successful!');
      }
      onLogin();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Pickle Profit</h1>
          <p className="text-stone-600">Homemade Products Inventory Manager</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {firstTime
                ? 'Create your account to get started'
                : isRegister
                ? 'Create a new account to access the system'
                : 'Login to manage your inventory'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required={isRegister}
                    data-testid="input-fullname"
                    className="h-12"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="input-username"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl active:scale-95"
                disabled={loading}
                data-testid="submit-button"
              >
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
              </Button>
            </form>

            {!firstTime && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm text-primary hover:underline"
                  data-testid="toggle-auth-mode"
                >
                  {isRegister
                    ? 'Already have an account? Login'
                    : "Don't have an account? Create one"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
