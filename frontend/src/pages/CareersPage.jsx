import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { 
  Rocket, 
  Users, 
  Zap, 
  Globe, 
  ChevronRight, 
  Briefcase,
  Send,
  CheckCircle,
  Linkedin,
  Mail,
  Phone,
  User,
  FileText,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CareersPage = () => {
  const [roles, setRoles] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    experience: '',
    whyJoin: ''
  });

  // Icon mapping for dynamic icons
  const iconMap = {
    Rocket, Users, Zap, Globe, Briefcase, Sparkles, CheckCircle
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      // Check file extension (only .pdf and .docx allowed)
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.pdf', '.docx'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        toast.error('Only PDF and DOCX files are allowed');
        e.target.value = '';
        return;
      }
      
      // Check MIME type as secondary validation
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file format. Please upload a PDF or DOCX file');
        e.target.value = '';
        return;
      }
      
      setResumeFile(file);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchBenefits();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API}/careers/roles`);
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchBenefits = async () => {
    try {
      const res = await axios.get(`${API}/careers/benefits`);
      setBenefits(res.data);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      // Fallback to defaults
      setBenefits([
        { icon: 'Rocket', title: 'Shape the Future', description: 'Work on cutting-edge AI and data technology' },
        { icon: 'Users', title: 'World-Class Team', description: 'Collaborate with industry experts and innovators' },
        { icon: 'Zap', title: 'Fast Growth', description: 'Accelerate your career in a high-growth startup' },
        { icon: 'Globe', title: 'Global Impact', description: 'Transform electronics supply chains worldwide' }
      ]);
    }
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Briefcase;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data with resume file as base64
      let submitData = {
        ...formData,
        role: selectedRole
      };
      
      // If there's a resume file, convert to base64
      if (resumeFile) {
        const reader = new FileReader();
        const base64Data = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
        submitData.resumeData = base64Data;
        submitData.resumeFileName = resumeFile.name;
      }
      
      await axios.post(`${API}/careers/apply`, submitData);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      // Extract and show specific error message from backend
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          const errorMessages = detail.map(err => {
            const field = err.loc?.[1] || 'field';
            const msg = err.msg || 'Invalid value';
            // Make field names user-friendly
            const fieldNames = {
              'name': 'Name',
              'email': 'Email',
              'phone': 'Phone',
              'linkedinUrl': 'LinkedIn Profile',
              'role': 'Role',
              'experience': 'Experience',
              'whyJoin': 'Why Join'
            };
            const friendlyField = fieldNames[field] || field;
            return `${friendlyField}: ${msg}`;
          });
          toast.error(errorMessages.join('\n'), { duration: 5000 });
        } else if (typeof detail === 'string') {
          toast.error(detail, { duration: 5000 });
        } else {
          toast.error('Failed to submit application. Please check your inputs.');
        }
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your interest in joining 1BUY.AI. We'll review your application and get back to you soon.
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO 
        title="Careers at 1BUY.AI | Join Our Team"
        description="Join 1BUY.AI and help build the future of electronics procurement intelligence. Explore open positions in AI, engineering, and more."
        keywords="1BUY.AI careers, jobs in AI, electronics procurement jobs, semiconductor industry careers, tech jobs"
        url="/careers"
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              We're Hiring
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Category Definers</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              We're building the future of electronics procurement intelligence. Be part of the team that's 
              transforming how the world's largest manufacturers source components.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
              >
                View Open Roles
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Join 1BUY.AI?</h2>
            <p className="text-lg text-slate-600">Be part of something transformative</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const IconComponent = getIcon(benefit.icon);
              return (
                <motion.div
                  key={benefit.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-slate-50">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-sm text-slate-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Roles & Application Form */}
      <section id="apply-form" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Open Roles */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Open Roles</h2>
              <p className="text-slate-600 mb-8">Select a role and tell us why you'd be a great fit</p>
              
              <div className="space-y-3">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRole === role.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedRole === role.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{role.title}</h3>
                          <p className="text-sm text-slate-500">{role.description}</p>
                        </div>
                      </div>
                      {selectedRole === role.id && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Apply Now
                  </CardTitle>
                  <p className="text-emerald-100 text-sm">Join us in defining the future of procurement</p>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-1">
                          <User className="w-3 h-3" /> Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone *
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          placeholder="+91 98765 43210"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin" className="flex items-center gap-1">
                          <Linkedin className="w-3 h-3" /> LinkedIn Profile
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          placeholder="linkedin.com/in/johndoe"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="role" className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Role *
                      </Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Relevant Experience
                      </Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="Tell us about your relevant experience, skills, and achievements..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whyJoin" className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Why do you want to join 1BUY.AI?
                      </Label>
                      <Textarea
                        id="whyJoin"
                        value={formData.whyJoin}
                        onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                        placeholder="What excites you about being a category definer in procurement intelligence?"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <Label htmlFor="resume" className="flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Attach Resume
                      </Label>
                      <div className="mt-1">
                        {resumeFile ? (
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            <span className="flex-1 text-sm text-emerald-700 truncate">{resumeFile.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              className="text-slate-400 hover:text-red-600 p-1 h-auto"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm text-slate-600">Click to upload your resume</p>
                            <p className="text-xs text-slate-400 mt-1">PDF or DOCX only (max 5MB)</p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="resume"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      By submitting, you agree to our privacy policy and consent to being contacted regarding your application.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We're builders, dreamers, and doers. We move fast, learn constantly, and believe that the 
            best ideas can come from anywhere. If you're ready to make an impact, we're ready for you.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
