import React, { useState, useEffect } from 'react';
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
  GripVertical
} from 'lucide-react';
import { logoUrl } from '../data/mock';

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
    return (
      <Badge variant="outline" className={styles[status] || styles.new}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'All', value: statusCounts.all, filter: 'all', icon: Users, color: 'bg-slate-600' },
          { label: 'New', value: statusCounts.new, filter: 'new', icon: Clock, color: 'bg-blue-600' },
          { label: 'Contacted', value: statusCounts.contacted, filter: 'contacted', icon: Phone, color: 'bg-yellow-600' },
          { label: 'Converted', value: statusCounts.converted, filter: 'converted', icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Closed', value: statusCounts.closed, filter: 'closed', icon: XCircle, color: 'bg-slate-400' },
        ].map((stat) => (
          <Card
            key={stat.filter}
            className={`cursor-pointer transition-all ${
              statusFilter === stat.filter ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'
            }`}
            onClick={() => setStatusFilter(stat.filter)}
          >
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

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No customer requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Interest</TableHead>
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
                      <p className="font-medium text-slate-900">
                        {request.firstName} {request.lastName}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {request.email}
                      </p>
                      {request.title && (
                        <p className="text-sm text-slate-400">{request.title}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                      <div>
                        <p className="font-medium">{request.company}</p>
                        {request.companySize && (
                          <p className="text-sm text-slate-400">{request.companySize}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="capitalize">{request.interest || '-'}</p>
                    {request.message && (
                      <p className="text-sm text-slate-400 max-w-xs truncate" title={request.message}>
                        {request.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(request.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(value) => onStatusUpdate(request.id, value, 'customer')}
                      disabled={updatingId === request.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
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

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(req => req.status === statusFilter);

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
    return (
      <Badge variant="outline" className={styles[status] || styles.new}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'All', value: statusCounts.all, filter: 'all', icon: Package, color: 'bg-slate-600' },
          { label: 'New', value: statusCounts.new, filter: 'new', icon: Clock, color: 'bg-blue-600' },
          { label: 'Contacted', value: statusCounts.contacted, filter: 'contacted', icon: Phone, color: 'bg-yellow-600' },
          { label: 'Approved', value: statusCounts.approved, filter: 'approved', icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Rejected', value: statusCounts.rejected, filter: 'rejected', icon: XCircle, color: 'bg-red-600' },
        ].map((stat) => (
          <Card
            key={stat.filter}
            className={`cursor-pointer transition-all ${
              statusFilter === stat.filter ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'
            }`}
            onClick={() => setStatusFilter(stat.filter)}
          >
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

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No supplier requests found</p>
        </div>
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
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{request.companyName}</p>
                      {request.website && (
                        <a 
                          href={request.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {request.website}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.contactName}</p>
                      <p className="text-sm text-slate-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {request.email}
                      </p>
                      {request.phone && (
                        <p className="text-sm text-slate-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="capitalize">{request.productCategories || '-'}</p>
                    {request.inventoryDescription && (
                      <p className="text-sm text-slate-400 max-w-xs truncate" title={request.inventoryDescription}>
                        {request.inventoryDescription}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-slate-400" />
                      <span className="capitalize">{request.regionsServed || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(request.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(value) => onStatusUpdate(request.id, value, 'supplier')}
                      disabled={updatingId === request.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
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

// Testimonials Management Component
const TestimonialsManager = ({ testimonials, isLoading, onRefresh }) => {
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    company: '',
    industry: '',
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setFormData({
      quote: '',
      author: '',
      company: '',
      industry: '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      quote: testimonial.quote,
      author: testimonial.author,
      company: testimonial.company,
      industry: testimonial.industry || '',
      isActive: testimonial.isActive
    });
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
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

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
      await axios.put(`${API}/testimonials/${testimonial.id}`, {
        isActive: !testimonial.isActive
      });
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
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="quote">Quote *</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Enter the testimonial quote..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author / Role *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g., CEO, VP Procurement"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Auto Components, Electronics"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Show on website</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingTestimonial ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12">
          <Quote className="h-12 w-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No testimonials yet</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add your first testimonial
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className={`${!testimonial.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-slate-400 mt-1">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-slate-500">#{index + 1}</span>
                        {!testimonial.isActive && (
                          <Badge variant="outline" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-slate-700 mb-3 line-clamp-2">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-slate-900">{testimonial.author}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-600">{testimonial.company}</span>
                        {testimonial.industry && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{testimonial.industry}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(testimonial)}
                      title={testimonial.isActive ? 'Hide' : 'Show'}
                    >
                      {testimonial.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 hover:text-red-700"
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
    </div>
  );
};

// Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [customerRequests, setCustomerRequests] = useState([]);
  const [supplierRequests, setSupplierRequests] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [customersRes, suppliersRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/demo-requests`),
        axios.get(`${API}/supplier-requests`),
        axios.get(`${API}/testimonials`)
      ]);
      setCustomerRequests(customersRes.data);
      setSupplierRequests(suppliersRes.data);
      setTestimonials(testimonialsRes.data);
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
        setCustomerRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        );
      } else {
        setSupplierRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        );
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoUrl} alt="1Buy.AI" className="h-8 w-auto" />
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{customerRequests.length}</p>
                  <p className="text-slate-500">Customer Requests</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{supplierRequests.length}</p>
                  <p className="text-slate-500">Supplier Requests</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Package className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{testimonials.filter(t => t.isActive).length}</p>
                  <p className="text-slate-500">Active Testimonials</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Quote className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Customers, Suppliers, and Testimonials */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="customers">
              <TabsList className="mb-6">
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customers ({customerRequests.length})
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Suppliers ({supplierRequests.length})
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Testimonials ({testimonials.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customers">
                <CustomerRequestsTable
                  requests={customerRequests}
                  isLoading={isLoading}
                  onStatusUpdate={updateStatus}
                  updatingId={updatingId}
                />
              </TabsContent>

              <TabsContent value="suppliers">
                <SupplierRequestsTable
                  requests={supplierRequests}
                  isLoading={isLoading}
                  onStatusUpdate={updateStatus}
                  updatingId={updatingId}
                />
              </TabsContent>

              <TabsContent value="testimonials">
                <TestimonialsManager
                  testimonials={testimonials}
                  isLoading={isLoading}
                  onRefresh={fetchData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Main Admin Page
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
};

export default AdminPage;
