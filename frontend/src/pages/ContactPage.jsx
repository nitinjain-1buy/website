import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  ArrowRight,
  Mail,
  MapPin,
  CheckCircle,
  Upload,
  Calendar,
  Clock,
  Building2,
  Users,
  Package,
  Globe,
  Rocket
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Customer Form Component
const CustomerForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    companySize: '',
    interest: [],
    factoryLocations: [],
    headOfficeLocation: [],
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const currentInterests = prev.interest;
      if (currentInterests.includes(interest)) {
        return { ...prev, interest: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interest: [...currentInterests, interest] };
      }
    });
  };

  const handleFactoryLocationToggle = (location) => {
    setFormData(prev => {
      const current = prev.factoryLocations;
      if (current.includes(location)) {
        return { ...prev, factoryLocations: current.filter(l => l !== location) };
      } else {
        return { ...prev, factoryLocations: [...current, location] };
      }
    });
  };

  const handleHeadOfficeToggle = (location) => {
    setFormData(prev => {
      const current = prev.headOfficeLocation;
      if (current.includes(location)) {
        return { ...prev, headOfficeLocation: current.filter(l => l !== location) };
      } else {
        return { ...prev, headOfficeLocation: [...current, location] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/demo-requests`, formData);
      setIsSubmitted(true);
      toast.success('Thank you! Our team will reach out shortly.');
    } catch (error) {
      console.error('Error submitting demo request:', error);
      // Extract and show specific error message from backend
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const errorMessages = detail.map(err => {
            const field = err.loc?.[1] || 'field';
            const msg = err.msg || 'Invalid value';
            const fieldNames = {
              'firstName': 'First Name',
              'lastName': 'Last Name',
              'email': 'Email',
              'phone': 'Phone',
              'company': 'Company',
              'title': 'Job Title',
              'message': 'Message'
            };
            const friendlyField = fieldNames[field] || field;
            return `${friendlyField}: ${msg}`;
          });
          toast.error(errorMessages.join('\n'), { duration: 5000 });
        } else if (typeof detail === 'string') {
          toast.error(detail, { duration: 5000 });
        } else {
          toast.error('Failed to submit. Please check your inputs.');
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Thank you for reaching out
        </h3>
        <p className="text-slate-600 mb-8">
          Our team will review your request and get back to you within 1-2 business days.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="border-slate-300"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="John"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="Smith"
            className="h-12"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Work Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="john@company.com"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
            placeholder="Acme Electronics"
            className="h-12"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="VP of Procurement"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => handleSelectChange('companySize', value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-50">1-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-1000">201-1,000 employees</SelectItem>
              <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
              <SelectItem value="5000+">5,000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>What are you interested in? <span className="text-slate-500 font-normal">(Select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: 'demo', label: 'Request a Demo' },
            { value: 'pilot', label: 'Start a Pilot' },
            { value: '1data', label: 'Learn about 1Data' },
            { value: '1source', label: 'Learn about 1Source' },
            { value: '1xcess', label: 'Learn about 1Xcess' },
            { value: 'general', label: 'General Inquiry' }
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.interest.includes(item.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.interest.includes(item.value)}
                onChange={() => handleInterestToggle(item.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Factory Locations <span className="text-slate-500 font-normal">(Select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: 'asia-pacific', label: 'Asia Pacific' },
            { value: 'europe', label: 'Europe' },
            { value: 'north-america', label: 'North America' },
            { value: 'south-america', label: 'South America' }
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.factoryLocations.includes(item.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.factoryLocations.includes(item.value)}
                onChange={() => handleFactoryLocationToggle(item.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Head Office Location <span className="text-slate-500 font-normal">(Select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: 'asia-pacific', label: 'Asia Pacific' },
            { value: 'europe', label: 'Europe' },
            { value: 'north-america', label: 'North America' },
            { value: 'south-america', label: 'South America' }
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.headOfficeLocation.includes(item.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.headOfficeLocation.includes(item.value)}
                onChange={() => handleHeadOfficeToggle(item.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message <span className="text-slate-500 font-normal">(Optional)</span></Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your procurement challenges or what you'd like to learn more about..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 h-12 px-8"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
};

// Supplier Form Component
const SupplierForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    productCategories: [],
    regionsServed: [],
    inventoryDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const currentCategories = prev.productCategories;
      if (currentCategories.includes(category)) {
        return { ...prev, productCategories: currentCategories.filter(c => c !== category) };
      } else {
        return { ...prev, productCategories: [...currentCategories, category] };
      }
    });
  };

  const handleRegionToggle = (region) => {
    setFormData(prev => {
      const currentRegions = prev.regionsServed;
      if (currentRegions.includes(region)) {
        return { ...prev, regionsServed: currentRegions.filter(r => r !== region) };
      } else {
        return { ...prev, regionsServed: [...currentRegions, region] };
      }
    });
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const currentInterests = prev.interest;
      if (currentInterests.includes(interest)) {
        return { ...prev, interest: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interest: [...currentInterests, interest] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/supplier-requests`, formData);
      setIsSubmitted(true);
      toast.success('Thank you! We will review your application and get back to you.');
    } catch (error) {
      console.error('Error submitting supplier request:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Application Received
        </h3>
        <p className="text-slate-600 mb-8">
          Thank you for your interest in partnering with 1Buy.AI. Our team will review your application and reach out within 3-5 business days.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="border-slate-300"
        >
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
            placeholder="Your Company Ltd."
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Person *</Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            required
            placeholder="John Smith"
            className="h-12"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="supplierEmail">Email *</Label>
          <Input
            id="supplierEmail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="sales@company.com"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Company Website</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://www.yourcompany.com"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label>Product Categories * <span className="text-slate-500 font-normal">(Select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: 'semiconductors', label: 'Semiconductors / ICs' },
            { value: 'passive', label: 'Passive Components' },
            { value: 'connectors', label: 'Connectors' },
            { value: 'electromechanical', label: 'Electromechanical' },
            { value: 'power', label: 'Power Management' },
            { value: 'sensors', label: 'Sensors' },
            { value: 'displays', label: 'Displays & Optoelectronics' },
            { value: 'other', label: 'Other' }
          ].map((category) => (
            <label
              key={category.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.productCategories.includes(category.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.productCategories.includes(category.value)}
                onChange={() => handleCategoryToggle(category.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Regions Served * <span className="text-slate-500 font-normal">(Select all that apply)</span></Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { value: 'asia-pacific', label: 'Asia Pacific' },
            { value: 'americas', label: 'Americas' },
            { value: 'europe', label: 'Europe' }
          ].map((region) => (
            <label
              key={region.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.regionsServed.includes(region.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.regionsServed.includes(region.value)}
                onChange={() => handleRegionToggle(region.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{region.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inventoryDescription">Tell us about your inventory & capabilities</Label>
        <Textarea
          id="inventoryDescription"
          name="inventoryDescription"
          value={formData.inventoryDescription}
          onChange={handleInputChange}
          placeholder="Describe your product range, inventory levels, MOQs, lead times, and any specializations..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 h-12 px-8"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
};

const ContactPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 py-20">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50 animate-badge-pulse inline-flex items-center gap-2">
              <Rocket className="w-3 h-3 animate-pulse" />
              Get Started
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Let&apos;s work together
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Whether you&apos;re looking to optimize your procurement or partner with us as a supplier — we&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Forms */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Forms with Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="customers" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="customers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    For Customers
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    For Suppliers
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="customers">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Request a Demo</h2>
                    <p className="text-slate-600">See how 1Buy.AI can transform your procurement decisions.</p>
                  </div>
                  <CustomerForm />
                </TabsContent>
                
                <TabsContent value="suppliers">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Get Enlisted as a Supplier</h2>
                    <p className="text-slate-600">Join our global network and reach OEMs & EMS companies worldwide.</p>
                  </div>
                  <SupplierForm />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="bg-slate-50 border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">What to expect</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Quick Response</p>
                        <p className="text-sm text-slate-600">We'll get back within 1-2 business days</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Personalized Demo</p>
                        <p className="text-sm text-slate-600">See how 1Buy.AI applies to your use case</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Upload className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Start with Your BOM</p>
                        <p className="text-sm text-slate-600">Optional: Bring sample data for analysis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-emerald-800 mb-2">Enterprise Inquiry?</h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    For enterprise partnerships and large-scale deployments, reach out directly.
                  </p>
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">sales@1buy.ai</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Global Operations</h3>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-600">
                    <p>Serving customers across Asia, Europe & Americas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
