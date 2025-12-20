import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { logoUrl } from '../data/mock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from query params or default to /admin
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      if (response.data.success) {
        sessionStorage.setItem('adminAuth', 'true');
        navigate(redirectTo);
      }
    } catch (err) {
      setError('Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" />
      
      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </button>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logoUrl} alt="1Buy.AI" className="h-10 w-auto" />
            </div>
            
            {/* Lock Icon */}
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-600/30">
              <Lock className="h-8 w-8 text-emerald-500" />
            </div>
            
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  'Login to Dashboard'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-center text-slate-500 text-xs">
                Protected area. Authorized personnel only.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer branding */}
        <p className="text-center text-slate-600 text-sm mt-8">
          © {new Date().getFullYear()} 1Buy.AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
