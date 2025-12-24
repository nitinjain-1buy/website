import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Lock,
  LogOut,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Building2,
  Package,
  Globe,
  Quote,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  BarChart3,
  Image,
  Settings,
  Layers,
  Save,
  Rocket,
  MapPin,
  GitBranch,
  Newspaper,
  Search,
  ExternalLink,
  FileText
} from 'lucide-react';
import { logoUrl } from '../data/mock';
import MapLocationEditor from '../components/MapLocationEditor';
import RegionCardsManager from '../components/RegionCardsManager';
import FlowLinesManager from '../components/FlowLinesManager';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      if (response.data.success) {
        sessionStorage.setItem('adminAuth', 'true');
        onLogin();
      }
    } catch (err) {
      setError('Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <p className="text-slate-500 text-sm">Enter password to access</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="h-12"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Site Stats Manager Component
const SiteStatsManager = ({ stats, isLoading, onRefresh }) => {
  const [editingStat, setEditingStat] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    label: '',
    description: '',
    order: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingStat(null);
    setFormData({ key: '', value: '', label: '', description: '', order: stats.length });
    setIsDialogOpen(true);
  };

  const openEditDialog = (stat) => {
    setEditingStat(stat);
    setFormData({
      key: stat.key,
      value: stat.value,
      label: stat.label,
      description: stat.description,
      order: stat.order
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.value || !formData.label) {
      toast.error('Please fill in value and label');
      return;
    }

    setIsSaving(true);
    try {
      if (editingStat) {
        await axios.put(`${API}/site-stats/${editingStat.id}`, formData);
        toast.success('Stat updated successfully');
      } else {
        await axios.post(`${API}/site-stats`, formData);
        toast.success('Stat created successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save stat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) return;
    try {
      await axios.delete(`${API}/site-stats/${id}`);
      toast.success('Stat deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete stat');
    }
  };

  const seedStats = async () => {
    try {
      const result = await axios.post(`${API}/site-stats/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed stats');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Site Statistics</h3>
          <p className="text-sm text-slate-500">Manage the key metrics shown on the homepage</p>
        </div>
        <div className="flex gap-2">
          {stats.length === 0 && (
            <Button onClick={seedStats} variant="outline">
              Load Defaults
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Stat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStat ? 'Edit Stat' : 'Add New Stat'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="e.g., 30+, 15-20%, 25M+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label *</Label>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="e.g., Enterprise Customers"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Active OEM & EMS engagements"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Key (identifier)</Label>
                    <Input
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., enterprise_customers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BarChart3 className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No stats yet</p>
          <Button onClick={seedStats} variant="outline" className="mt-4">
            Load Default Stats
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
                    <p className="font-medium text-slate-900">{stat.label}</p>
                    <p className="text-sm text-slate-500">{stat.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(stat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(stat.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Hero Section Manager Component
const HeroSectionManager = ({ heroData, isLoading, onRefresh }) => {
  const [formData, setFormData] = useState({
    headline: '',
    subHeadline: '',
    ctaPrimary: '',
    ctaSecondary: '',
    screenshotUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (heroData) {
      setFormData({
        headline: heroData.headline || '',
        subHeadline: heroData.subHeadline || '',
        ctaPrimary: heroData.ctaPrimary || '',
        ctaSecondary: heroData.ctaSecondary || '',
        screenshotUrl: heroData.screenshotUrl || ''
      });
    }
  }, [heroData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API}/hero-section`, formData);
      toast.success('Hero section updated successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update hero section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Hero Section</h3>
          <p className="text-sm text-slate-500">Edit the main headline and call-to-action buttons</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Main Headline</Label>
            <Input
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Enter main headline"
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Sub-headline</Label>
            <Textarea
              value={formData.subHeadline}
              onChange={(e) => setFormData({ ...formData, subHeadline: e.target.value })}
              placeholder="Enter sub-headline"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary CTA Button</Label>
              <Input
                value={formData.ctaPrimary}
                onChange={(e) => setFormData({ ...formData, ctaPrimary: e.target.value })}
                placeholder="e.g., Request a Demo"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary CTA Button</Label>
              <Input
                value={formData.ctaSecondary}
                onChange={(e) => setFormData({ ...formData, ctaSecondary: e.target.value })}
                placeholder="e.g., Watch Demo"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Platform Screenshot URL</Label>
            <Input
              value={formData.screenshotUrl}
              onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
              placeholder="https://..."
            />
            {formData.screenshotUrl && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img src={formData.screenshotUrl} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

// Customer Logos Manager Component
const CustomerLogosManager = ({ logos, isLoading, onRefresh }) => {
  const [editingLogo, setEditingLogo] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', logoUrl: '', order: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    showClientNames: true,
    clientSectionTitle: "Trusted by leading OEMs and EMSs of the world"
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Fetch site settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/site-settings`);
        if (res.data) {
          setSiteSettings(res.data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const updateSiteSettings = async (updates) => {
    setIsUpdatingSettings(true);
    try {
      const res = await axios.put(`${API}/site-settings`, updates);
      setSiteSettings(res.data);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const openCreateDialog = () => {
    setEditingLogo(null);
    setFormData({ name: '', logoUrl: '', order: logos.length });
    setIsDialogOpen(true);
  };

  const openEditDialog = (logo) => {
    setEditingLogo(logo);
    setFormData({ name: logo.name, logoUrl: logo.logoUrl || '', order: logo.order });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a company name');
      return;
    }

    setIsSaving(true);
    try {
      if (editingLogo) {
        await axios.put(`${API}/customer-logos/${editingLogo.id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await axios.post(`${API}/customer-logos`, formData);
        toast.success('Customer added successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`${API}/customer-logos/${id}`);
      toast.success('Customer deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const seedLogos = async () => {
    try {
      const result = await axios.post(`${API}/customer-logos/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed logos');
    }
  };

  return (
    <div>
      {/* Site Settings Card */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Display Settings
        </h4>
        
        {/* Toggle for showing client names */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="font-medium text-slate-700">Show Client Names</label>
            <p className="text-xs text-slate-500">Toggle visibility of client names on homepage</p>
          </div>
          <button
            onClick={() => updateSiteSettings({ showClientNames: !siteSettings.showClientNames })}
            disabled={isUpdatingSettings}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              siteSettings.showClientNames ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                siteSettings.showClientNames ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Section Title */}
        <div className="space-y-2">
          <label className="font-medium text-slate-700 text-sm">Section Title</label>
          <div className="flex gap-2">
            <Input
              value={siteSettings.clientSectionTitle}
              onChange={(e) => setSiteSettings({ ...siteSettings, clientSectionTitle: e.target.value })}
              placeholder="Trusted by leading OEMs and EMSs of the world"
              className="flex-1"
            />
            <Button 
              onClick={() => updateSiteSettings({ clientSectionTitle: siteSettings.clientSectionTitle })}
              disabled={isUpdatingSettings}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Customer Logos</h3>
          <p className="text-sm text-slate-500">Manage the customer names shown on homepage</p>
        </div>
        <div className="flex gap-2">
          {logos.length === 0 && (
            <Button onClick={seedLogos} variant="outline">Load Defaults</Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLogo ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Google, Dixon, Uno Minda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL (optional)</Label>
                  <Input
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : logos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No customers yet</p>
          <Button onClick={seedLogos} variant="outline" className="mt-4">
            Load Default Customers
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {logos.map((logo) => (
            <div key={logo.id} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full group">
              <span className="font-medium text-slate-700">{logo.name}</span>
              <button onClick={() => openEditDialog(logo)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-3 w-3 text-slate-500" />
              </button>
              <button onClick={() => handleDelete(logo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Products Manager Component
const ProductsManager = ({ products, isLoading, onRefresh }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    tagline: '',
    description: '',
    features: '',
    benefits: '',
    icon: 'Database',
    order: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  const iconOptions = ['Database', 'ShoppingCart', 'RefreshCw', 'Package', 'Zap', 'Layers'];

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      productId: '',
      name: '',
      tagline: '',
      description: '',
      features: '',
      benefits: '',
      icon: 'Database',
      order: products.length
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      features: product.features.join('\n'),
      benefits: product.benefits.join('\n'),
      icon: product.icon,
      order: product.order
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.productId) {
      toast.error('Please fill in required fields');
      return;
    }

    const payload = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim()),
      benefits: formData.benefits.split('\n').filter(b => b.trim())
    };

    setIsSaving(true);
    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, payload);
        toast.success('Product created successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Product deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const seedProducts = async () => {
    try {
      const result = await axios.post(`${API}/products/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed products');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Products</h3>
          <p className="text-sm text-slate-500">Manage product descriptions and features</p>
        </div>
        <div className="flex gap-2">
          {products.length === 0 && (
            <Button onClick={seedProducts} variant="outline">Load Defaults</Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product ID *</Label>
                    <Input
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      placeholder="e.g., 1data, 1source"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., 1Data"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g., Pricing & Risk Intelligence"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Benefits (one per line)</Label>
                  <Textarea
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="Benefit 1&#10;Benefit 2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(icon => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No products yet</p>
          <Button onClick={seedProducts} variant="outline" className="mt-4">
            Load Default Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-slate-900">{product.name}</h4>
                      <Badge variant="outline">{product.productId}</Badge>
                    </div>
                    <p className="text-emerald-600 font-medium">{product.tagline}</p>
                    <p className="text-slate-600 text-sm mt-1">{product.description}</p>
                    <p className="text-slate-400 text-xs mt-2">{product.features.length} features, {product.benefits.length} benefits</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Customer Requests Table Component
const CustomerRequestsTable = ({ requests, isLoading, onStatusUpdate, updatingId }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(req => req.status === statusFilter);

  const statusCounts = {
    all: requests.length,
    new: requests.filter(r => r.status === 'new').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    converted: requests.filter(r => r.status === 'converted').length,
    closed: requests.filter(r => r.status === 'closed').length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      converted: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return <Badge variant="outline" className={styles[status] || styles.new}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'All', value: statusCounts.all, filter: 'all', icon: Users, color: 'bg-slate-600' },
          { label: 'New', value: statusCounts.new, filter: 'new', icon: Clock, color: 'bg-blue-600' },
          { label: 'Contacted', value: statusCounts.contacted, filter: 'contacted', icon: Phone, color: 'bg-yellow-600' },
          { label: 'Converted', value: statusCounts.converted, filter: 'converted', icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Closed', value: statusCounts.closed, filter: 'closed', icon: XCircle, color: 'bg-slate-400' },
        ].map((stat) => (
          <Card key={stat.filter} className={`cursor-pointer transition-all ${statusFilter === stat.filter ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`} onClick={() => setStatusFilter(stat.filter)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" /></div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-slate-300" /><p className="text-slate-500 mt-2">No customer requests found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Factory Locations</TableHead>
                <TableHead>Head Office</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{request.firstName} {request.lastName}</p>
                      <p className="text-sm text-slate-500 flex items-center"><Mail className="h-3 w-3 mr-1" />{request.email}</p>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center"><Building2 className="h-4 w-4 mr-2 text-slate-400" /><span>{request.company}</span></div></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(request.interest) && request.interest.length > 0
                        ? request.interest.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs capitalize">{item}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(request.factoryLocations) && request.factoryLocations.length > 0
                        ? request.factoryLocations.map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{loc.replace('-', ' ')}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(request.headOfficeLocation) && request.headOfficeLocation.length > 0
                        ? request.headOfficeLocation.map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{loc.replace('-', ' ')}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell><p className="text-sm">{formatDate(request.createdAt)}</p></TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <Select value={request.status} onValueChange={(value) => onStatusUpdate(request.id, value, 'customer')} disabled={updatingId === request.id}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Supplier Requests Table Component  
const SupplierRequestsTable = ({ requests, isLoading, onStatusUpdate, updatingId }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = statusFilter === 'all' ? requests : requests.filter(req => req.status === statusFilter);

  const statusCounts = {
    all: requests.length,
    new: requests.filter(r => r.status === 'new').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return <Badge variant="outline" className={styles[status] || styles.new}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'All', value: statusCounts.all, filter: 'all', icon: Package, color: 'bg-slate-600' },
          { label: 'New', value: statusCounts.new, filter: 'new', icon: Clock, color: 'bg-blue-600' },
          { label: 'Contacted', value: statusCounts.contacted, filter: 'contacted', icon: Phone, color: 'bg-yellow-600' },
          { label: 'Approved', value: statusCounts.approved, filter: 'approved', icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Rejected', value: statusCounts.rejected, filter: 'rejected', icon: XCircle, color: 'bg-red-600' },
        ].map((stat) => (
          <Card key={stat.filter} className={`cursor-pointer transition-all ${statusFilter === stat.filter ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`} onClick={() => setStatusFilter(stat.filter)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" /></div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12"><Package className="h-12 w-12 mx-auto text-slate-300" /><p className="text-slate-500 mt-2">No supplier requests found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Regions</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell><p className="font-medium text-slate-900">{request.companyName}</p></TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.contactName}</p>
                      <p className="text-sm text-slate-500">{request.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(request.productCategories) && request.productCategories.length > 0
                        ? request.productCategories.map((cat, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs capitalize">{cat}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(request.regionsServed) && request.regionsServed.length > 0
                        ? request.regionsServed.map((region, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{region.replace('-', ' ')}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell><p className="text-sm">{formatDate(request.createdAt)}</p></TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <Select value={request.status} onValueChange={(value) => onStatusUpdate(request.id, value, 'supplier')} disabled={updatingId === request.id}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Map Locations Manager Component
const MapLocationsManager = ({ locations, isLoading, onRefresh }) => {
  const [editingLocation, setEditingLocation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', x: 50, y: 50, type: 'Data Source', order: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingLocation(null);
    setFormData({ name: '', x: 50, y: 50, type: 'Data Source', order: 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (location) => {
    setEditingLocation(location);
    setFormData({ 
      name: location.name, 
      x: location.x, 
      y: location.y, 
      type: location.type || 'Data Source', 
      order: location.order || 0 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a location name');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        x: parseFloat(formData.x),
        y: parseFloat(formData.y),
        type: formData.type,
        order: parseInt(formData.order) || 0
      };
      
      if (editingLocation) {
        await axios.put(`${API}/map-locations/${editingLocation.id}`, payload);
        toast.success('Location updated successfully');
      } else {
        await axios.post(`${API}/map-locations`, payload);
        toast.success('Location created successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      await axios.delete(`${API}/map-locations/${id}`);
      toast.success('Location deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const seedLocations = async () => {
    try {
      const result = await axios.post(`${API}/map-locations/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed locations');
    }
  };

  // Count by type
  const sourcingHubs = locations.filter(l => l.type === 'Sourcing Hub').length;
  const dataSources = locations.filter(l => l.type === 'Data Source').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Map Locations</h3>
          <p className="text-sm text-slate-500">
            Manage world map markers - 
            <span className="text-emerald-600 ml-1">{sourcingHubs} Sourcing Hubs</span>, 
            <span className="text-blue-600 ml-1">{dataSources} Data Sources</span>
          </p>
        </div>
        <div className="flex gap-2">
          {locations.length === 0 && (
            <Button onClick={seedLocations} variant="outline">Load Defaults</Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., China, Taiwan, USA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Coordinate (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                      placeholder="50"
                    />
                    <p className="text-xs text-slate-500">0 = left edge, 100 = right edge</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Y Coordinate (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: e.target.value })}
                      placeholder="50"
                    />
                    <p className="text-xs text-slate-500">0 = top edge, 100 = bottom edge</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sourcing Hub">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                          Sourcing Hub (Green)
                        </span>
                      </SelectItem>
                      <SelectItem value="Data Source">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          Data Source (Blue)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reference Guide */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-medium text-slate-900 mb-2">📍 Coordinate Guide</h4>
        <p className="text-sm text-slate-600 mb-2">
          The map uses percentage-based coordinates where (0,0) is top-left and (100,100) is bottom-right.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">USA:</span> ~18, 42
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Europe:</span> ~48, 32
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">India:</span> ~66, 48
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">China:</span> ~76, 36
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Japan:</span> ~87, 36
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Taiwan:</span> ~82, 44
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <MapPin className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No map locations yet</p>
          <Button onClick={seedLocations} variant="outline" className="mt-4">
            Load Default Locations
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>X Coord</TableHead>
                <TableHead>Y Coord</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location, index) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={location.type === 'Sourcing Hub' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${location.type === 'Sourcing Hub' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      {location.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{location.x}</TableCell>
                  <TableCell>{location.y}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(location)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Testimonials Manager Component
const TestimonialsManager = ({ testimonials, isLoading, onRefresh }) => {
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ quote: '', author: '', company: '', industry: '', isActive: true });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setFormData({ quote: '', author: '', company: '', industry: '', isActive: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ quote: testimonial.quote, author: testimonial.author, company: testimonial.company, industry: testimonial.industry || '', isActive: testimonial.isActive });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.quote || !formData.author || !formData.company) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSaving(true);
    try {
      if (editingTestimonial) {
        await axios.put(`${API}/testimonials/${editingTestimonial.id}`, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post(`${API}/testimonials`, formData);
        toast.success('Testimonial created successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await axios.delete(`${API}/testimonials/${id}`);
      toast.success('Testimonial deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const toggleActive = async (testimonial) => {
    try {
      await axios.put(`${API}/testimonials/${testimonial.id}`, { isActive: !testimonial.isActive });
      toast.success(`Testimonial ${testimonial.isActive ? 'hidden' : 'shown'}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Manage Testimonials</h3>
          <p className="text-sm text-slate-500">Add, edit, or remove customer testimonials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="quote">Quote *</Label>
                <Textarea id="quote" value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} placeholder="Enter the testimonial quote..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author / Role *</Label>
                  <Input id="author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="e.g., CEO, VP Procurement" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Company name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g., Auto Components, Electronics" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
                <Label htmlFor="isActive">Show on website</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : (editingTestimonial ? 'Update' : 'Create')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12"><Quote className="h-12 w-12 mx-auto text-slate-300" /><p className="text-slate-500 mt-2">No testimonials yet</p></div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className={`${!testimonial.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-slate-500">#{index + 1}</span>
                        {!testimonial.isActive && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                      </div>
                      <p className="text-slate-700 mb-3 line-clamp-2">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-slate-900">{testimonial.author}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-600">{testimonial.company}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(testimonial)}>
                      {testimonial.isActive ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(testimonial)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(testimonial.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// News Manager Component
const NewsManager = ({ isLoading: parentLoading, onRefresh }) => {
  const [articles, setArticles] = useState([]);
  const [queries, setQueries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [logsLimit, setLogsLimit] = useState(20);
  const [newQuery, setNewQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMoreLogs, setIsLoadingMoreLogs] = useState(false);
  const [activeNewsTab, setActiveNewsTab] = useState('queries');

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      setIsLoading(true);
      const [articlesRes, queriesRes, logsRes, logsCountRes] = await Promise.all([
        axios.get(`${API}/news?limit=100`),
        axios.get(`${API}/news/queries`),
        axios.get(`${API}/news/logs?limit=${logsLimit}`),
        axios.get(`${API}/news/logs/count`)
      ]);
      // Filter out articles without valid links
      const validArticles = articlesRes.data.filter(
        a => a.link && a.link.trim() !== '' && a.title && a.source?.name
      );
      setArticles(validArticles);
      setQueries(queriesRes.data);
      setLogs(logsRes.data);
      setTotalLogsCount(logsCountRes.data.count);
    } catch (error) {
      console.error('Error fetching news data:', error);
      toast.error('Failed to fetch news data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreLogs = async () => {
    try {
      setIsLoadingMoreLogs(true);
      const newLimit = logsLimit + 20;
      const logsRes = await axios.get(`${API}/news/logs?limit=${newLimit}`);
      setLogs(logsRes.data);
      setLogsLimit(newLimit);
    } catch (error) {
      toast.error('Failed to load more logs');
    } finally {
      setIsLoadingMoreLogs(false);
    }
  };

  const handleRefreshNews = async () => {
    try {
      setIsRefreshing(true);
      await axios.post(`${API}/news/refresh`);
      toast.success('News refresh triggered (SerpAPI + GDELT)');
      setTimeout(fetchNewsData, 3000); // Wait for fetch to complete
    } catch (error) {
      toast.error('Failed to refresh news');
    } finally {
      setIsRefreshing(false);
    }
  };

  const [isRefreshingMediaStack, setIsRefreshingMediaStack] = useState(false);
  
  const handleRefreshMediaStack = async () => {
    if (!window.confirm('MediaStack has rate limits. Are you sure you want to refresh? (Runs weekly on Mondays automatically)')) {
      return;
    }
    try {
      setIsRefreshingMediaStack(true);
      await axios.post(`${API}/news/refresh-mediastack`);
      toast.success('MediaStack refresh triggered');
      setTimeout(fetchNewsData, 5000); // Wait for fetch to complete
    } catch (error) {
      toast.error('Failed to refresh MediaStack news');
    } finally {
      setIsRefreshingMediaStack(false);
    }
  };

  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStats, setScrapeStats] = useState(null);

  const fetchScrapeStats = async () => {
    try {
      const res = await axios.get(`${API}/news/scrape-stats`);
      setScrapeStats(res.data);
    } catch (error) {
      console.error('Failed to fetch scrape stats');
    }
  };

  useEffect(() => {
    fetchScrapeStats();
  }, []);

  const handleStartScraping = async () => {
    try {
      setIsScraping(true);
      await axios.post(`${API}/news/scrape?limit=100`);
      toast.success('Article scraping started (100 articles)');
      // Refresh stats after a delay
      setTimeout(fetchScrapeStats, 10000);
    } catch (error) {
      toast.error('Failed to start scraping');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAddQuery = async () => {
    if (!newQuery.trim()) return;
    try {
      await axios.post(`${API}/news/queries`, { query: newQuery, isActive: true });
      toast.success('Search query added');
      setNewQuery('');
      fetchNewsData();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Query already exists');
      } else {
        toast.error('Failed to add query');
      }
    }
  };

  const handleToggleQuery = async (queryId, isActive) => {
    try {
      await axios.patch(`${API}/news/queries/${queryId}?isActive=${!isActive}`);
      fetchNewsData();
    } catch (error) {
      toast.error('Failed to update query');
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Delete this search query?')) return;
    try {
      await axios.delete(`${API}/news/queries/${queryId}`);
      toast.success('Query deleted');
      fetchNewsData();
    } catch (error) {
      toast.error('Failed to delete query');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Market Intelligence & News</h3>
          <p className="text-sm text-slate-500">SerpAPI + GDELT: Twice daily | MediaStack: Weekly (Mondays)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleRefreshNews} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Daily'}
          </Button>
          <Button 
            onClick={handleRefreshMediaStack} 
            disabled={isRefreshingMediaStack}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingMediaStack ? 'animate-spin' : ''}`} />
            {isRefreshingMediaStack ? 'Refreshing...' : 'MediaStack (Weekly)'}
          </Button>
          <Button 
            onClick={handleStartScraping} 
            disabled={isScraping}
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <FileText className={`h-4 w-4 mr-2 ${isScraping ? 'animate-pulse' : ''}`} />
            {isScraping ? 'Scraping...' : 'Scrape Content'}
          </Button>
        </div>
      </div>

      {/* Scrape Stats Banner */}
      {scrapeStats && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-indigo-600 font-medium">CONTENT SCRAPING</p>
                <p className="text-lg font-bold text-indigo-900">{scrapeStats.scrapeRate}% Complete</p>
              </div>
              <div className="flex gap-4 text-sm flex-wrap">
                <div>
                  <span className="text-emerald-600">Scraped:</span>
                  <span className="ml-1 font-semibold text-emerald-700">{scrapeStats.scraped}</span>
                </div>
                <div>
                  <span className="text-indigo-600">Pending:</span>
                  <span className="ml-1 font-semibold text-indigo-900">{scrapeStats.pending}</span>
                </div>
                <div>
                  <span className="text-slate-500">Paywall:</span>
                  <span className="ml-1 font-semibold text-slate-600">{scrapeStats.permanentFailures || 0}</span>
                </div>
                <div>
                  <span className="text-amber-600">Retryable:</span>
                  <span className="ml-1 font-semibold text-amber-600">{scrapeStats.retryableFailures || 0}</span>
                </div>
                <div>
                  <span className="text-red-500">Other Errors:</span>
                  <span className="ml-1 font-semibold text-red-600">{scrapeStats.otherFailures || 0}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchScrapeStats}
              className="text-indigo-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveNewsTab('queries')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeNewsTab === 'queries'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Queries & Articles
            </div>
          </button>
          <button
            onClick={() => setActiveNewsTab('logs')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeNewsTab === 'logs'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Fetch Logs
              <Badge variant="secondary" className="text-xs">{totalLogsCount}</Badge>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeNewsTab === 'queries' ? (
        <>
          {/* Search Queries Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add new search query (e.g., semiconductor shortage)"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQuery()}
                />
                <Button onClick={handleAddQuery}>
                  <Plus className="h-4 w-4 mr-2" />Add
                </Button>
              </div>
              <div className="space-y-2">
                {queries.length === 0 ? (
                  <p className="text-sm text-slate-500">No search queries configured. Default "electronics parts" will be used.</p>
                ) : (
                  queries.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{q.query}</span>
                        <Badge variant={q.isActive ? 'default' : 'secondary'} className={q.isActive ? 'bg-emerald-100 text-emerald-700' : ''}>
                          {q.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={q.isActive} onCheckedChange={() => handleToggleQuery(q.id, q.isActive)} />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteQuery(q.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fetched Articles ({articles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <Newspaper className="h-12 w-12 mx-auto text-slate-300" />
                  <p className="text-slate-500 mt-2">No articles fetched yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {articles.map((article) => (
                    <div key={article.id || article.link} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      {article.thumbnail_small && (
                        <img src={article.thumbnail_small} alt="" className="w-16 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:text-emerald-600 line-clamp-2">
                          {article.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{article.source?.name}</span>
                          <span>•</span>
                          <span>{formatDate(article.iso_date)}</span>
                          <Badge variant="outline" className="text-xs">{article.query}</Badge>
                        </div>
                      </div>
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-slate-400 hover:text-emerald-600" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Fetch Logs Tab */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Fetch Logs</CardTitle>
              <Badge variant="outline" className="text-slate-500">
                Showing {logs.length} of {totalLogsCount} logs
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-slate-300" />
                <p className="text-slate-500 mt-2">No fetch logs yet</p>
                <p className="text-slate-400 text-sm">Logs will appear here after the first news fetch</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge 
                        variant={log.status === 'success' ? 'default' : 'secondary'} 
                        className={log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      >
                        {log.status}
                      </Badge>
                      {log.api && (
                        <Badge 
                          variant="outline" 
                          className={
                            log.api === 'SerpAPI' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : log.api === 'MediaStack'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }
                        >
                          {log.api}
                        </Badge>
                      )}
                      <span className="font-medium text-slate-700">"{log.query}"</span>
                      <span className="text-slate-500">
                        {log.newArticles !== undefined ? (
                          <>
                            {log.articlesFound || log.articlesCount} found, 
                            <span className="text-emerald-600 font-medium ml-1">{log.newArticles} new</span>
                            {log.existingUpdated > 0 && (
                              <span className="text-blue-500 ml-1">({log.existingUpdated} tagged)</span>
                            )}
                          </>
                        ) : (
                          <>{log.articlesCount} articles</>
                        )}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs whitespace-nowrap ml-2">{formatDate(log.fetchedAt)}</span>
                  </div>
                ))}
                
                {/* View More Button */}
                {logs.length < totalLogsCount && (
                  <div className="pt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMoreLogs}
                      disabled={isLoadingMoreLogs}
                      className="w-full"
                    >
                      {isLoadingMoreLogs ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          View More Logs
                          <span className="ml-2 text-slate-400">({totalLogsCount - logs.length} remaining)</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [customerRequests, setCustomerRequests] = useState([]);
  const [supplierRequests, setSupplierRequests] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [siteStats, setSiteStats] = useState([]);
  const [heroSection, setHeroSection] = useState(null);
  const [customerLogos, setCustomerLogos] = useState([]);
  const [products, setProducts] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [regionCards, setRegionCards] = useState([]);
  const [flowLines, setFlowLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [customersRes, suppliersRes, testimonialsRes, statsRes, heroRes, logosRes, productsRes, mapLocationsRes, regionCardsRes, flowLinesRes] = await Promise.all([
        axios.get(`${API}/demo-requests`),
        axios.get(`${API}/supplier-requests`),
        axios.get(`${API}/testimonials`),
        axios.get(`${API}/site-stats`),
        axios.get(`${API}/hero-section`),
        axios.get(`${API}/customer-logos`),
        axios.get(`${API}/products`),
        axios.get(`${API}/map-locations`),
        axios.get(`${API}/region-cards`),
        axios.get(`${API}/flow-lines`)
      ]);
      setCustomerRequests(customersRes.data);
      setSupplierRequests(suppliersRes.data);
      setTestimonials(testimonialsRes.data);
      setSiteStats(statsRes.data);
      setHeroSection(heroRes.data);
      setCustomerLogos(logosRes.data);
      setProducts(productsRes.data);
      setMapLocations(mapLocationsRes.data);
      setRegionCards(regionCardsRes.data);
      setFlowLines(flowLinesRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (requestId, newStatus, type) => {
    setUpdatingId(requestId);
    try {
      const endpoint = type === 'customer' ? 'demo-requests' : 'supplier-requests';
      await axios.patch(`${API}/${endpoint}/${requestId}/status?status=${newStatus}`);
      if (type === 'customer') {
        setCustomerRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
      } else {
        setSupplierRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    onLogout();
  };

  const [activeTab, setActiveTab] = useState('site-settings');

  const sidebarItems = [
    { id: 'site-settings', label: 'Site Settings', icon: Settings, count: null },
    { id: 'news', label: 'News & Intelligence', icon: Newspaper, count: null },
    { id: 'stats', label: 'Stats', icon: BarChart3, count: siteStats.length },
    { id: 'customers-list', label: 'Customers', icon: Building2, count: customerLogos.length },
    { id: 'products', label: 'Products', icon: Layers, count: products.length },
    { id: 'map-locations', label: 'Map', icon: MapPin, count: mapLocations.length },
    { id: 'flow-lines', label: 'Flows', icon: GitBranch, count: flowLines.length },
    { id: 'region-cards', label: 'Regions', icon: Globe, count: regionCards.length },
    { id: 'testimonials', label: 'Testimonials', icon: Quote, count: testimonials.length },
    { id: 'demo-requests', label: 'Demo Requests', icon: Users, count: customerRequests.length },
    { id: 'suppliers', label: 'Suppliers', icon: Package, count: supplierRequests.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoUrl} alt="1Buy.AI" className="h-8 w-auto" />
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                size="sm" 
                onClick={() => window.location.href = '/platform'}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Go to Platform
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <Badge variant="secondary" className={`text-xs ${activeTab === item.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                      {item.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{customerRequests.length}</p>
                    <p className="text-slate-500 text-sm">Demo Requests</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{supplierRequests.length}</p>
                    <p className="text-slate-500 text-sm">Supplier Requests</p>
                  </div>
                  <Package className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{testimonials.filter(t => t.isActive).length}</p>
                    <p className="text-slate-500 text-sm">Testimonials</p>
                  </div>
                  <Quote className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{customerLogos.length}</p>
                    <p className="text-slate-500 text-sm">Customers Listed</p>
                  </div>
                  <Building2 className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <Card>
            <CardContent className="p-6">
              {activeTab === 'site-settings' && (
                <HeroSectionManager heroData={heroSection} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'news' && (
                <NewsManager isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'stats' && (
                <SiteStatsManager stats={siteStats} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'customers-list' && (
                <CustomerLogosManager logos={customerLogos} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'products' && (
                <ProductsManager products={products} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'map-locations' && (
                <MapLocationEditor locations={mapLocations} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'flow-lines' && (
                <FlowLinesManager flowLines={flowLines} locations={mapLocations} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'region-cards' && (
                <RegionCardsManager regionCards={regionCards} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'testimonials' && (
                <TestimonialsManager testimonials={testimonials} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'demo-requests' && (
                <CustomerRequestsTable requests={customerRequests} isLoading={isLoading} onStatusUpdate={updateStatus} updatingId={updatingId} />
              )}
              {activeTab === 'suppliers' && (
                <SupplierRequestsTable requests={supplierRequests} isLoading={isLoading} onStatusUpdate={updateStatus} updatingId={updatingId} />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

// Main Admin Page
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
  const navigate = useNavigate();

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminPage;
