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
  FileText,
  AlertTriangle,
  Briefcase,
  Zap,
  Eye,
  UserCheck,
  UserX,
  Linkedin,
  Download,
  MessageSquare
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
    clientSectionTitle: "Trusted by leading OEMs and EMSs of the world",
    clientSectionSubtitle: "Built for procurement leaders who demand precision",
    targetAudience: ["CEOs & Owners", "Chief Procurement Officers", "Chief Financial Officers", "Sourcing Teams"],
    twitterUrl: '',
    linkedinUrl: ''
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [newAudienceTag, setNewAudienceTag] = useState('');

  // Fetch site settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/site-settings`);
        if (res.data) {
          setSiteSettings({
            ...siteSettings,
            ...res.data,
            targetAudience: res.data.targetAudience || ["CEOs & Owners", "Chief Procurement Officers", "Chief Financial Officers", "Sourcing Teams"]
          });
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

        {/* Section Subtitle */}
        <div className="space-y-2">
          <label className="font-medium text-slate-700 text-sm">Section Subtitle</label>
          <div className="flex gap-2">
            <Input
              value={siteSettings.clientSectionSubtitle || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, clientSectionSubtitle: e.target.value })}
              placeholder="Built for procurement leaders who demand precision"
              className="flex-1"
            />
            <Button 
              onClick={() => updateSiteSettings({ clientSectionSubtitle: siteSettings.clientSectionSubtitle })}
              disabled={isUpdatingSettings}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Target Audience Tags */}
        <div className="space-y-2">
          <label className="font-medium text-slate-700 text-sm">Target Audience Tags</label>
          <p className="text-xs text-slate-500 mb-2">These appear as pill badges below the subtitle</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(siteSettings.targetAudience || []).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200"
              >
                {tag}
                <button
                  onClick={() => {
                    const newTags = siteSettings.targetAudience.filter((_, i) => i !== index);
                    setSiteSettings({ ...siteSettings, targetAudience: newTags });
                    updateSiteSettings({ targetAudience: newTags });
                  }}
                  className="ml-1 text-slate-400 hover:text-red-500"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newAudienceTag}
              onChange={(e) => setNewAudienceTag(e.target.value)}
              placeholder="Add new audience tag (e.g., Supply Chain Managers)"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newAudienceTag.trim()) {
                  const newTags = [...(siteSettings.targetAudience || []), newAudienceTag.trim()];
                  setSiteSettings({ ...siteSettings, targetAudience: newTags });
                  updateSiteSettings({ targetAudience: newTags });
                  setNewAudienceTag('');
                }
              }}
            />
            <Button 
              onClick={() => {
                if (newAudienceTag.trim()) {
                  const newTags = [...(siteSettings.targetAudience || []), newAudienceTag.trim()];
                  setSiteSettings({ ...siteSettings, targetAudience: newTags });
                  updateSiteSettings({ targetAudience: newTags });
                  setNewAudienceTag('');
                }
              }}
              disabled={isUpdatingSettings || !newAudienceTag.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">Social Media Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-slate-700 text-sm flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={siteSettings.linkedinUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/1buy-ai"
                  className="flex-1"
                />
                <Button 
                  onClick={() => updateSiteSettings({ linkedinUrl: siteSettings.linkedinUrl })}
                  disabled={isUpdatingSettings}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-medium text-slate-700 text-sm flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter) URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={siteSettings.twitterUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, twitterUrl: e.target.value })}
                  placeholder="https://x.com/1buy_ai"
                  className="flex-1"
                />
                <Button 
                  onClick={() => updateSiteSettings({ twitterUrl: siteSettings.twitterUrl })}
                  disabled={isUpdatingSettings}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">These links will appear in the website footer (icons only show when URLs are set)</p>
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
                      {request.phone && (
                        <p className="text-sm text-slate-500 flex items-center"><Phone className="h-3 w-3 mr-1" />{request.phone}</p>
                      )}
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

// Risk Category Configuration Manager Component
const RiskCategoryConfigManager = () => {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    label: '',
    strongTriggers: '',
    mediumTriggers: '',
    order: 0
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get(`${API}/risk-categories/config`);
      setConfigs(res.data);
    } catch (error) {
      console.error('Error fetching risk category configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedDefaults = async () => {
    try {
      const res = await axios.post(`${API}/risk-categories/config/seed`);
      toast.success(res.data.message);
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to seed defaults');
    }
  };

  const openCreateDialog = () => {
    setEditingConfig(null);
    setFormData({
      category: '',
      label: '',
      strongTriggers: '',
      mediumTriggers: '',
      order: configs.length
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (config) => {
    setEditingConfig(config);
    setFormData({
      category: config.category,
      label: config.label,
      strongTriggers: config.strongTriggers?.join(', ') || '',
      mediumTriggers: config.mediumTriggers?.join(', ') || '',
      order: config.order || 0
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.label) {
      toast.error('Category key and label are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        category: formData.category.toUpperCase().replace(/\s+/g, '_'),
        label: formData.label,
        strongTriggers: formData.strongTriggers.split(',').map(s => s.trim()).filter(s => s),
        mediumTriggers: formData.mediumTriggers.split(',').map(s => s.trim()).filter(s => s),
        order: formData.order
      };

      if (editingConfig) {
        await axios.put(`${API}/risk-categories/config/${editingConfig.category}`, payload);
        toast.success('Category updated');
      } else {
        await axios.post(`${API}/risk-categories/config`, payload);
        toast.success('Category created');
      }
      setIsDialogOpen(false);
      fetchConfigs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category}"?`)) return;
    try {
      await axios.delete(`${API}/risk-categories/config/${category}`);
      toast.success('Category deleted');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Risk Category Configuration
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Configure triggers for each risk category</p>
          </div>
          <div className="flex gap-2">
            {configs.length === 0 && (
              <Button variant="outline" size="sm" onClick={seedDefaults}>
                Load Defaults
              </Button>
            )}
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-slate-300" />
            <p className="text-slate-500 mt-2">No risk categories configured</p>
            <Button variant="outline" className="mt-4" onClick={seedDefaults}>
              Load Default Categories
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => (
              <div key={config.category} className="border rounded-lg p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900">{config.label}</span>
                      <Badge variant="outline" className="text-xs font-mono">{config.category}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Strong:</span>
                        {config.strongTriggers?.slice(0, 5).map((trigger, idx) => (
                          <span key={idx} className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {trigger}
                          </span>
                        ))}
                        {config.strongTriggers?.length > 5 && (
                          <span className="text-xs text-slate-500">+{config.strongTriggers.length - 5} more</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Medium:</span>
                        {config.mediumTriggers?.slice(0, 5).map((trigger, idx) => (
                          <span key={idx} className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {trigger}
                          </span>
                        ))}
                        {config.mediumTriggers?.length > 5 && (
                          <span className="text-xs text-slate-500">+{config.mediumTriggers.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(config)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(config.category)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingConfig ? 'Edit Risk Category' : 'Add Risk Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Key</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., SUPPLY_SHORTAGE"
                    disabled={!!editingConfig}
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">Uppercase with underscores</p>
                </div>
                <div>
                  <Label>Display Label</Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Supply Shortage"
                  />
                </div>
              </div>
              <div>
                <Label>Strong Triggers</Label>
                <Textarea
                  value={formData.strongTriggers}
                  onChange={(e) => setFormData({ ...formData, strongTriggers: e.target.value })}
                  placeholder="shortage, allocation, backorder, out of stock, constrained supply"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">Comma-separated. 1 strong trigger = category assigned (strength: 100)</p>
              </div>
              <div>
                <Label>Medium Triggers</Label>
                <Textarea
                  value={formData.mediumTriggers}
                  onChange={(e) => setFormData({ ...formData, mediumTriggers: e.target.value })}
                  placeholder="tight supply, limited availability, scarcity"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">Comma-separated. 2+ medium triggers = category assigned (strength: 60)</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
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
  const [riskCategories, setRiskCategories] = useState([]);

  // Risk category labels for display
  const RISK_CATEGORY_LABELS = {
    'SUPPLY_SHORTAGE': 'Supply Shortage',
    'LEAD_TIME_VOLATILITY': 'Lead Time',
    'PRICE_VOLATILITY': 'Price Risk',
    'EOL_LIFECYCLE': 'EOL/Lifecycle',
    'BOM_CHANGE_COMPATIBILITY': 'BOM Change',
    'TARIFF_TRADE_POLICY': 'Tariff/Trade',
    'EXPORT_CONTROLS_SANCTIONS': 'Export Controls',
    'GEOPOLITICAL_CONFLICT': 'Geopolitical',
    'LOGISTICS_SHIPPING_DISRUPTION': 'Logistics',
    'FACTORY_FAB_OUTAGE': 'Factory Outage',
    'QUALITY_COUNTERFEIT': 'Quality/Counterfeit',
    'SUPPLIER_FINANCIAL_RISK': 'Supplier Risk',
    'REGULATORY_COMPLIANCE': 'Regulatory',
    'CYBER_SECURITY_OPERATIONAL': 'Cyber Security',
    'DEMAND_SHOCK': 'Demand Shock'
  };

  useEffect(() => {
    fetchNewsData();
    fetchRiskCategories();
  }, []);

  const fetchRiskCategories = async () => {
    try {
      const res = await axios.get(`${API}/news/risk-categories`);
      setRiskCategories(res.data);
    } catch (error) {
      console.error('Error fetching risk categories:', error);
    }
  };

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
            onClick={() => setActiveNewsTab('risk')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeNewsTab === 'risk'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Categories
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">{riskCategories.length}</Badge>
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
      {activeNewsTab === 'risk' ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Risk Categories Overview
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Article counts by risk category (sorted by frequency)</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchRiskCategories}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {riskCategories
                  .sort((a, b) => b.count - a.count)
                  .map((cat, idx) => (
                    <div 
                      key={cat.category} 
                      className={`p-4 rounded-lg border ${
                        idx === 0 ? 'bg-orange-50 border-orange-200' :
                        idx === 1 ? 'bg-amber-50 border-amber-200' :
                        idx === 2 ? 'bg-yellow-50 border-yellow-200' :
                        'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <p className="text-2xl font-bold text-slate-900">{cat.count}</p>
                      <p className={`text-sm font-medium ${
                        idx === 0 ? 'text-orange-700' :
                        idx === 1 ? 'text-amber-700' :
                        idx === 2 ? 'text-yellow-700' :
                        'text-slate-600'
                      }`}>
                        {RISK_CATEGORY_LABELS[cat.category] || cat.category}
                      </p>
                    </div>
                  ))}
              </div>
              {riskCategories.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-slate-300" />
                  <p className="text-slate-500 mt-2">No risk data available yet</p>
                  <p className="text-xs text-slate-400">Run the scraper and risk analysis to populate data</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Risk Category Configuration */}
          <RiskCategoryConfigManager />
        </>
      ) : activeNewsTab === 'queries' ? (
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

// Careers Manager Component
const CareersManager = ({ benefits, roles, applications, isLoading, onRefresh }) => {
  const [activeSection, setActiveSection] = useState('applications');
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('benefit'); // 'benefit' or 'role'
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    interviewerEmail: '',
    comments: '',
    interviewDate: '',
    nextSteps: ''
  });
  const [isAddingReview, setIsAddingReview] = useState(false);

  const iconOptions = ['Rocket', 'Users', 'Zap', 'Globe', 'Briefcase', 'Sparkles', 'CheckCircle'];

  const openCreateDialog = (type) => {
    setEditingItem(null);
    setDialogType(type);
    if (type === 'benefit') {
      setFormData({ icon: 'Rocket', title: '', description: '', order: benefits.length });
    } else {
      setFormData({ id: '', title: '', description: '', icon: 'Briefcase', order: roles.length });
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (item, type) => {
    setEditingItem(item);
    setDialogType(type);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = dialogType === 'benefit' ? 'careers/benefits' : 'careers/roles-config';
      if (editingItem) {
        await axios.put(`${API}/${endpoint}/${editingItem.id}`, formData);
        toast.success(`${dialogType === 'benefit' ? 'Benefit' : 'Role'} updated successfully`);
      } else {
        // For roles, we need to generate an ID from the title
        if (dialogType === 'role' && !formData.id) {
          formData.id = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        await axios.post(`${API}/${endpoint}`, formData);
        toast.success(`${dialogType === 'benefit' ? 'Benefit' : 'Role'} created successfully`);
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to save ${dialogType}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const endpoint = type === 'benefit' ? 'careers/benefits' : 'careers/roles-config';
      await axios.delete(`${API}/${endpoint}/${id}`);
      toast.success(`${type === 'benefit' ? 'Benefit' : 'Role'} deleted successfully`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/careers/applications/${appId}?status=${status}`);
      toast.success(`Application marked as ${status}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const deleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await axios.delete(`${API}/careers/applications/${appId}`);
      toast.success('Application deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  // Download resume as file
  const downloadResume = (app) => {
    if (!app.resumeData || !app.resumeFileName) {
      toast.error('No resume available');
      return;
    }
    
    try {
      // Determine MIME type from filename
      const ext = app.resumeFileName.toLowerCase().split('.').pop();
      let mimeType = 'application/octet-stream';
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'doc') mimeType = 'application/msword';
      else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Convert base64 to blob
      const byteCharacters = atob(app.resumeData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = app.resumeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  // Add interview review
  const addReview = async (appId) => {
    if (!reviewForm.interviewerEmail || !reviewForm.comments || !reviewForm.interviewDate) {
      toast.error('Please fill in required fields (Email, Comments, Date)');
      return;
    }
    
    setIsAddingReview(true);
    try {
      await axios.post(`${API}/careers/applications/${appId}/reviews`, reviewForm);
      toast.success('Review added successfully');
      setReviewForm({ interviewerEmail: '', comments: '', interviewDate: '', nextSteps: '' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to add review');
    } finally {
      setIsAddingReview(false);
    }
  };

  // Delete interview review
  const deleteReview = async (appId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API}/careers/applications/${appId}/reviews/${reviewId}`);
      toast.success('Review deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-700', label: 'New' },
      reviewed: { color: 'bg-yellow-100 text-yellow-700', label: 'Reviewed' },
      shortlisted: { color: 'bg-emerald-100 text-emerald-700', label: 'Shortlisted' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button 
          variant={activeSection === 'applications' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('applications')}
          className={activeSection === 'applications' ? 'bg-emerald-600' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          Applications ({applications.length})
        </Button>
        <Button 
          variant={activeSection === 'benefits' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('benefits')}
          className={activeSection === 'benefits' ? 'bg-emerald-600' : ''}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Benefits ({benefits.length})
        </Button>
        <Button 
          variant={activeSection === 'roles' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('roles')}
          className={activeSection === 'roles' ? 'bg-emerald-600' : ''}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Roles ({roles.length})
        </Button>
      </div>

      {/* Applications Section */}
      {activeSection === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Job Applications</h3>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{app.name}</h4>
                          <Badge variant="outline">{app.roleTitle || app.role}</Badge>
                          {app.resumeData && (
                            <Badge className="bg-emerald-100 text-emerald-700">Resume Attached</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {app.phone}
                            </span>
                          )}
                          {app.linkedinUrl && (
                            <a href={app.linkedinUrl.startsWith('http') ? app.linkedinUrl : `https://${app.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <ExternalLink className="w-3 h-3" />
                              LinkedIn
                            </a>
                          )}
                          {app.resumeData && (
                            <button 
                              onClick={() => downloadResume(app)}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              <Download className="w-3 h-3" />
                              Download Resume
                            </button>
                          )}
                        </div>
                        {app.experience && (
                          <p className="text-sm text-slate-600 mt-2">
                            <strong>Experience:</strong> {app.experience}
                          </p>
                        )}
                        {app.whyJoin && (
                          <p className="text-sm text-slate-600">
                            <strong>Why Join:</strong> {app.whyJoin}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-slate-400">
                            Applied: {new Date(app.appliedAt).toLocaleString()}
                          </p>
                          {app.reviews && app.reviews.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {app.reviews.length} Review{app.reviews.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status Dropdown */}
                        <Select 
                          value={app.status || 'new'} 
                          onValueChange={(value) => updateApplicationStatus(app.id, value)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                New
                              </span>
                            </SelectItem>
                            <SelectItem value="reviewed">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                Under Review
                              </span>
                            </SelectItem>
                            <SelectItem value="shortlisted">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Selected
                              </span>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Rejected
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          title="Add Review"
                          className="text-slate-500 hover:text-emerald-600"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteApplication(app.id)}
                          title="Delete"
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Interview Reviews Section */}
                    {expandedApp === app.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Interview Reviews
                          {app.reviews && app.reviews.length > 0 && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {app.reviews.length} {app.reviews.length === 1 ? 'review' : 'reviews'}
                            </Badge>
                          )}
                        </h5>
                        <p className="text-xs text-slate-500 mb-3">Record feedback from each interviewer. Multiple interviewers can add their reviews.</p>
                        
                        {/* Existing Reviews */}
                        {app.reviews && app.reviews.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {app.reviews.map((review, idx) => (
                              <div key={review.id} className="bg-slate-50 p-3 rounded-lg border-l-4 border-emerald-400">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 text-sm flex-wrap">
                                      <Badge variant="outline" className="text-xs bg-white">Review #{idx + 1}</Badge>
                                      <span className="font-medium text-slate-700">{review.interviewerEmail}</span>
                                      <span className="text-slate-400">|</span>
                                      <span className="text-slate-500">{new Date(review.interviewDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">{review.comments}</p>
                                    {review.nextSteps && (
                                      <p className="text-sm text-emerald-600 mt-1">
                                        <strong>Next Steps:</strong> {review.nextSteps}
                                      </p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">Added: {new Date(review.createdAt).toLocaleString()}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteReview(app.id, review.id)}
                                    className="text-slate-400 hover:text-red-600 h-6 w-6 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add New Review Form */}
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <h6 className="font-medium text-sm mb-3 text-emerald-800">Add Interview Review</h6>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Interviewer Email *</Label>
                              <Input
                                type="email"
                                value={reviewForm.interviewerEmail}
                                onChange={(e) => setReviewForm({...reviewForm, interviewerEmail: e.target.value})}
                                placeholder="interviewer@company.com"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Interview Date *</Label>
                              <Input
                                type="date"
                                value={reviewForm.interviewDate}
                                onChange={(e) => setReviewForm({...reviewForm, interviewDate: e.target.value})}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label className="text-xs">Comments / Remarks *</Label>
                            <Textarea
                              value={reviewForm.comments}
                              onChange={(e) => setReviewForm({...reviewForm, comments: e.target.value})}
                              placeholder="Your feedback about the candidate..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div className="mt-3">
                            <Label className="text-xs">Next Steps</Label>
                            <Input
                              value={reviewForm.nextSteps}
                              onChange={(e) => setReviewForm({...reviewForm, nextSteps: e.target.value})}
                              placeholder="e.g., Schedule technical round, Send offer letter..."
                              className="h-8 text-sm"
                            />
                          </div>
                          <Button
                            onClick={() => addReview(app.id)}
                            disabled={isAddingReview}
                            className="mt-3 bg-emerald-600 hover:bg-emerald-700 h-8 text-sm"
                          >
                            {isAddingReview ? 'Adding...' : 'Add Review'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Benefits Section */}
      {activeSection === 'benefits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">"Why Join" Benefits</h3>
            <Button size="sm" onClick={() => openCreateDialog('benefit')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Benefit
            </Button>
          </div>
          <p className="text-sm text-slate-500">These appear on the Careers page under "Why Join 1BUY.AI?"</p>
          
          <div className="grid gap-3">
            {benefits.map((benefit) => (
              <Card key={benefit.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-600 text-sm font-bold">{benefit.icon?.charAt(0) || 'R'}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-slate-500">{benefit.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">Icon: {benefit.icon}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(benefit, 'benefit')}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(benefit.id, 'benefit')} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Roles Section */}
      {activeSection === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Career Roles</h3>
            <Button size="sm" onClick={() => openCreateDialog('role')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Role
            </Button>
          </div>
          <p className="text-sm text-slate-500">These appear in the Open Roles section and the application form dropdown</p>
          
          <div className="grid gap-3">
            {roles.map((role) => (
              <Card key={role.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{role.title}</h4>
                      <p className="text-sm text-slate-500">{role.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">ID: {role.id}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(role, 'role')}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id, 'role')} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} {dialogType === 'benefit' ? 'Benefit' : 'Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === 'role' && !editingItem && (
              <div>
                <Label>Role ID</Label>
                <Input 
                  value={formData.id || ''} 
                  onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')})}
                  placeholder="e.g., senior_engineer"
                />
                <p className="text-xs text-slate-500 mt-1">Unique identifier (auto-generated if left blank)</p>
              </div>
            )}
            <div>
              <Label>Title *</Label>
              <Input 
                value={formData.title || ''} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={dialogType === 'benefit' ? 'e.g., Fast Growth' : 'e.g., Senior Engineer'}
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            {dialogType === 'benefit' && (
              <div>
                <Label>Icon</Label>
                <Select value={formData.icon || 'Rocket'} onValueChange={(v) => setFormData({...formData, icon: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Page Content Manager Component (Problems, Workflow, Use Cases, About, Why)
const ContentManager = ({ problems, workflowSteps, useCases, aboutData, whyData, isLoading, onRefresh }) => {
  const [activeSection, setActiveSection] = useState('problems');
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('problem');
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const iconOptions = ['TrendingDown', 'Layers', 'AlertTriangle', 'Package', 'Upload', 'Search', 'CheckCircle', 'Zap', 'DollarSign', 'Settings', 'Activity', 'Smartphone'];

  const openCreateDialog = (type) => {
    setEditingItem(null);
    setDialogType(type);
    if (type === 'problem') {
      setFormData({ title: '', description: '', icon: 'AlertTriangle', order: problems.length });
    } else if (type === 'workflow') {
      setFormData({ title: '', description: '', icon: 'CheckCircle', step: workflowSteps.length + 1 });
    } else if (type === 'usecase') {
      setFormData({ industry: '', description: '', icon: 'Settings', order: useCases.length });
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (item, type) => {
    setEditingItem(item);
    setDialogType(type);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let endpoint = '';
      if (dialogType === 'problem') endpoint = 'problems';
      else if (dialogType === 'workflow') endpoint = 'workflow-steps';
      else if (dialogType === 'usecase') endpoint = 'use-cases';

      if (editingItem) {
        await axios.put(`${API}/${endpoint}/${editingItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post(`${API}/${endpoint}`, formData);
        toast.success('Created successfully');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      let endpoint = '';
      if (type === 'problem') endpoint = 'problems';
      else if (type === 'workflow') endpoint = 'workflow-steps';
      else if (type === 'usecase') endpoint = 'use-cases';
      await axios.delete(`${API}/${endpoint}/${id}`);
      toast.success('Deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleAboutSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API}/about-data`, formData);
      toast.success('About data updated');
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b pb-2 flex-wrap">
        <Button variant={activeSection === 'problems' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection('problems')} className={activeSection === 'problems' ? 'bg-emerald-600' : ''}>
          Problems ({problems.length})
        </Button>
        <Button variant={activeSection === 'workflow' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection('workflow')} className={activeSection === 'workflow' ? 'bg-emerald-600' : ''}>
          Workflow ({workflowSteps.length})
        </Button>
        <Button variant={activeSection === 'usecases' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection('usecases')} className={activeSection === 'usecases' ? 'bg-emerald-600' : ''}>
          Use Cases ({useCases.length})
        </Button>
        <Button variant={activeSection === 'about' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection('about')} className={activeSection === 'about' ? 'bg-emerald-600' : ''}>
          About
        </Button>
        <Button variant={activeSection === 'why' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection('why')} className={activeSection === 'why' ? 'bg-emerald-600' : ''}>
          Why Us
        </Button>
      </div>

      {/* Problems Section */}
      {activeSection === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Problem Cards</h3>
              <p className="text-sm text-slate-500">Homepage "The Problem" section</p>
            </div>
            <Button size="sm" onClick={() => openCreateDialog('problem')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" /> Add Problem
            </Button>
          </div>
          <div className="grid gap-3">
            {problems.map((problem) => (
              <Card key={problem.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{problem.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{problem.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(problem, 'problem')}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(problem.id, 'problem')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Section */}
      {activeSection === 'workflow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <p className="text-sm text-slate-500">Homepage "How It Works" section</p>
            </div>
            <Button size="sm" onClick={() => openCreateDialog('workflow')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </div>
          <div className="grid gap-3">
            {workflowSteps.map((step) => (
              <Card key={step.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(step, 'workflow')}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(step.id, 'workflow')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Use Cases Section */}
      {activeSection === 'usecases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Use Cases</h3>
              <p className="text-sm text-slate-500">Use Cases page content</p>
            </div>
            <Button size="sm" onClick={() => openCreateDialog('usecase')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" /> Add Use Case
            </Button>
          </div>
          <div className="grid gap-3">
            {useCases.map((useCase) => (
              <Card key={useCase.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{useCase.industry}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(useCase, 'usecase')}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(useCase.id, 'usecase')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* About Section */}
      {activeSection === 'about' && aboutData && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">About Page Content</h3>
          <Card className="border">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="font-semibold">Mission</Label>
                <p className="text-sm text-slate-600 mt-1">{aboutData.mission}</p>
              </div>
              <div>
                <Label className="font-semibold">Vision</Label>
                <p className="text-sm text-slate-600 mt-1">{aboutData.vision}</p>
              </div>
              <div>
                <Label className="font-semibold">Values ({aboutData.values?.length || 0})</Label>
                <div className="mt-2 grid gap-2">
                  {aboutData.values?.map((v, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded">
                      <span className="font-medium">{v.title}:</span> {v.description}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => { setFormData(aboutData); setDialogType('about'); setIsDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Pencil className="w-4 h-4 mr-2" /> Edit About Content
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Why Us Section */}
      {activeSection === 'why' && whyData && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Why Choose Us Content</h3>
          <Card className="border">
            <CardContent className="p-4 space-y-4">
              {whyData.differentiators?.map((diff, i) => (
                <div key={i} className="border-b pb-3 last:border-0">
                  <h4 className="font-semibold text-slate-900">{diff.title}</h4>
                  <ul className="mt-1 text-sm text-slate-600">
                    {diff.points?.map((point, j) => (
                      <li key={j}>• {point}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button onClick={() => { setFormData(whyData); setDialogType('why'); setIsDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Pencil className="w-4 h-4 mr-2" /> Edit Why Us Content
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Create'} {dialogType === 'problem' ? 'Problem' : dialogType === 'workflow' ? 'Workflow Step' : dialogType === 'usecase' ? 'Use Case' : dialogType === 'about' ? 'About Content' : 'Why Us'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dialogType === 'problem' && (
              <>
                <div><Label>Title *</Label><Input value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Description *</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div><Label>Icon</Label>
                  <Select value={formData.icon || 'AlertTriangle'} onValueChange={(v) => setFormData({...formData, icon: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            {dialogType === 'workflow' && (
              <>
                <div><Label>Step Number</Label><Input type="number" value={formData.step || 1} onChange={(e) => setFormData({...formData, step: parseInt(e.target.value)})} /></div>
                <div><Label>Title *</Label><Input value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Description *</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div><Label>Icon</Label>
                  <Select value={formData.icon || 'CheckCircle'} onValueChange={(v) => setFormData({...formData, icon: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            {dialogType === 'usecase' && (
              <>
                <div><Label>Industry *</Label><Input value={formData.industry || ''} onChange={(e) => setFormData({...formData, industry: e.target.value})} /></div>
                <div><Label>Description *</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div><Label>Icon</Label>
                  <Select value={formData.icon || 'Settings'} onValueChange={(v) => setFormData({...formData, icon: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            {dialogType === 'about' && (
              <>
                <div><Label>Mission</Label><Textarea value={formData.mission || ''} onChange={(e) => setFormData({...formData, mission: e.target.value})} rows={3} /></div>
                <div><Label>Vision</Label><Textarea value={formData.vision || ''} onChange={(e) => setFormData({...formData, vision: e.target.value})} rows={3} /></div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={dialogType === 'about' ? handleAboutSave : handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Team Manager Component
const TeamManager = ({ members, isLoading, onRefresh }) => {
  const [editingMember, setEditingMember] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', bio: '', expertise: '', education: '', linkedin: '', type: 'team', order: members.length });
    setIsDialogOpen(true);
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Name and Role are required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingMember) {
        await axios.put(`${API}/team-members/${editingMember.id}`, formData);
        toast.success('Team member updated');
      } else {
        await axios.post(`${API}/team-members`, formData);
        toast.success('Team member added');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    try {
      await axios.delete(`${API}/team-members/${id}`);
      toast.success('Team member deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const founders = members.filter(m => m.type === 'founder');
  const team = members.filter(m => m.type !== 'founder');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button size="sm" onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>

      {founders.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-700 mb-2">Founders ({founders.length})</h4>
          <div className="grid gap-3">
            {founders.map((member) => (
              <Card key={member.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-emerald-600">{member.role}</p>
                      <p className="text-xs text-slate-500">{member.education}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {team.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-700 mb-2">Team ({team.length})</h4>
          <div className="grid gap-3">
            {team.map((member) => (
              <Card key={member.id} className="border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-slate-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div><Label>Name *</Label><Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Role *</Label><Input value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} /></div>
            <div><Label>Type</Label>
              <Select value={formData.type || 'team'} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Bio</Label><Textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} /></div>
            <div><Label>Expertise</Label><Input value={formData.expertise || ''} onChange={(e) => setFormData({...formData, expertise: e.target.value})} /></div>
            <div><Label>Education</Label><Input value={formData.education || ''} onChange={(e) => setFormData({...formData, education: e.target.value})} /></div>
            <div><Label>LinkedIn URL</Label><Input value={formData.linkedin || ''} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
  const [careerBenefits, setCareerBenefits] = useState([]);
  const [careerRoles, setCareerRoles] = useState([]);
  const [careerApplications, setCareerApplications] = useState([]);
  const [problems, setProblems] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [aboutData, setAboutData] = useState(null);
  const [whyData, setWhyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [customersRes, suppliersRes, testimonialsRes, statsRes, heroRes, logosRes, productsRes, mapLocationsRes, regionCardsRes, flowLinesRes, benefitsRes, rolesRes, applicationsRes, problemsRes, workflowRes, useCasesRes, teamRes, aboutRes, whyRes] = await Promise.all([
        axios.get(`${API}/demo-requests`),
        axios.get(`${API}/supplier-requests`),
        axios.get(`${API}/testimonials`),
        axios.get(`${API}/site-stats`),
        axios.get(`${API}/hero-section`),
        axios.get(`${API}/customer-logos`),
        axios.get(`${API}/products`),
        axios.get(`${API}/map-locations`),
        axios.get(`${API}/region-cards`),
        axios.get(`${API}/flow-lines`),
        axios.get(`${API}/careers/benefits`),
        axios.get(`${API}/careers/roles-config`),
        axios.get(`${API}/careers/applications`),
        axios.get(`${API}/problems`),
        axios.get(`${API}/workflow-steps`),
        axios.get(`${API}/use-cases`),
        axios.get(`${API}/team-members`),
        axios.get(`${API}/about-data`),
        axios.get(`${API}/why-data`)
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
      setCareerBenefits(benefitsRes.data);
      setCareerRoles(rolesRes.data);
      setCareerApplications(applicationsRes.data);
      setProblems(problemsRes.data);
      setWorkflowSteps(workflowRes.data);
      setUseCases(useCasesRes.data);
      setTeamMembers(teamRes.data);
      setAboutData(aboutRes.data);
      setWhyData(whyRes.data);
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
    { id: 'content', label: 'Page Content', icon: FileText, count: null },
    { id: 'careers', label: 'Careers', icon: Briefcase, count: careerApplications.length },
    { id: 'team', label: 'Team', icon: Users, count: teamMembers.length },
    { id: 'news', label: 'News & Intelligence', icon: Newspaper, count: null },
    { id: 'stats', label: 'Stats', icon: BarChart3, count: siteStats.length },
    { id: 'customers-list', label: 'Customers', icon: Building2, count: customerLogos.length },
    { id: 'products', label: 'Products', icon: Layers, count: products.length },
    { id: 'map-locations', label: 'Map', icon: MapPin, count: mapLocations.length },
    { id: 'flow-lines', label: 'Flows', icon: GitBranch, count: flowLines.length },
    { id: 'region-cards', label: 'Regions', icon: Globe, count: regionCards.length },
    { id: 'testimonials', label: 'Testimonials', icon: Quote, count: testimonials.length },
    { id: 'demo-requests', label: 'Demo Requests', icon: Clock, count: customerRequests.length },
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
              {activeTab === 'content' && (
                <ContentManager problems={problems} workflowSteps={workflowSteps} useCases={useCases} aboutData={aboutData} whyData={whyData} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'careers' && (
                <CareersManager benefits={careerBenefits} roles={careerRoles} applications={careerApplications} isLoading={isLoading} onRefresh={fetchData} />
              )}
              {activeTab === 'team' && (
                <TeamManager members={teamMembers} isLoading={isLoading} onRefresh={fetchData} />
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
