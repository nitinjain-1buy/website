import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, 
  Construction, 
  Database, 
  ShoppingCart, 
  RefreshCw,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';
import { logoUrl } from '../data/mock';

const PlatformPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/platform" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoUrl} alt="1Buy.AI" className="h-8 w-auto" />
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium">Platform</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Placeholder Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Platform Coming Soon
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            This is a placeholder for the 1Buy.AI platform. Your existing platform code will be integrated here.
          </p>
        </div>

        {/* Placeholder Cards - Representing Platform Modules */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Database className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1Data</h3>
              <p className="text-slate-500 text-sm">
                Pricing & Risk Intelligence Module
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1Source</h3>
              <p className="text-slate-500 text-sm">
                Sourcing Execution Module
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1Xcess</h3>
              <p className="text-slate-500 text-sm">
                Excess Inventory Module
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Placeholder */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-slate-600" />
              Platform Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active BOMs', value: '--', icon: Database },
                { label: 'Savings Identified', value: '--', icon: Zap },
                { label: 'RFQs in Progress', value: '--', icon: ShoppingCart },
                { label: 'Excess Listed', value: '--', icon: RefreshCw },
              ].map((stat, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 text-center">
                  <stat.icon className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-300">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Note */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <Settings className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">
            Ready for Integration
          </h3>
          <p className="text-emerald-700 text-sm max-w-xl mx-auto">
            This page is ready to be connected with your existing platform code. 
            Replace this placeholder with your platform components when ready.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PlatformPage;
