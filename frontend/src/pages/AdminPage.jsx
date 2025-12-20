import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
  Filter
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
          <p className="text-slate-500 text-sm">Enter password to access demo requests</p>
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

// Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/demo-requests`);
      setRequests(response.data);
    } catch (err) {
      toast.error('Failed to fetch demo requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await axios.patch(`${API}/demo-requests/${requestId}/status?status=${newStatus}`);
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
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
                onClick={fetchRequests}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All Requests', value: statusCounts.all, filter: 'all', icon: Users, color: 'bg-slate-600' },
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Demo Requests
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="ml-2">
                    {statusFilter}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-slate-500">
                Showing {filteredRequests.length} of {requests.length} requests
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                <p className="text-slate-500 mt-2">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-300" />
                <p className="text-slate-500 mt-2">No demo requests found</p>
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
                                <p className="text-sm text-slate-400">{request.companySize} employees</p>
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
                            onValueChange={(value) => updateStatus(request.id, value)}
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
