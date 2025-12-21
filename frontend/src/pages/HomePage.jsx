import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  problemsData,
  workflowSteps
} from '../data/mock';
import {
  TrendingDown,
  Layers,
  AlertTriangle,
  Package,
  Database,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  Upload,
  Search,
  CheckCircle,
  Zap,
  DollarSign,
  ChevronRight,
  Play
} from 'lucide-react';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import DemoVideoModal, { DemoVideoSection } from '../components/DemoVideoModal';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';
import GlobalNetworkMap from '../components/GlobalNetworkMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const iconMap = {
  TrendingDown,
  Layers,
  AlertTriangle,
  Package,
  Database,
  ShoppingCart,
  RefreshCw,
  Upload,
  Search,
  CheckCircle,
  Zap,
  DollarSign
};

// Default values for fallback
const defaultHeroData = {
  headline: "Decision-grade intelligence for electronics procurement",
  subHeadline: "From pricing and risk to execution and liquidation — the operating system for electronics procurement.",
  ctaPrimary: "Request a Demo",
  ctaSecondary: "Talk to Our Team",
  screenshotUrl: "https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/zedmi29e_Output.png"
};

const defaultStats = [
  { value: "15-20%", label: "Cost Savings Identified", description: "Average savings identified across customer BOMs" },
  { value: "25M+", label: "MPN Coverage", description: "Comprehensive part number database" },
  { value: "400+", label: "Data Sources", description: "Proprietary data pipes for intelligence" },
  { value: "30+", label: "Enterprise Customers", description: "Active OEM & EMS engagements" }
];

const defaultCustomers = [
  "Google", "Uno Minda", "Dixon", "Napino", "SGS Syrma", "NCR Atleos", "Lucas TVS", "Lumax", "Bajaj"
];

const defaultProducts = [
  {
    productId: "1data",
    name: "1Data",
    tagline: "Pricing & Risk Intelligence",
    description: "Bloomberg for Components. Independent global price benchmarks, alternate discovery, and risk intelligence for defensible procurement decisions.",
    features: ["Independent global price benchmarks", "Alternate part discovery", "Lifecycle and risk alerts", "AI-driven price predictions"],
    icon: "Database"
  },
  {
    productId: "1source",
    name: "1Source",
    tagline: "High-Impact Sourcing Execution",
    description: "Amazon for Procurement. Execute sourcing where it matters most with vetted global suppliers and transparent landed-cost comparison.",
    features: ["Vetted global suppliers", "Transparent landed-cost comparison", "Faster RFQ workflows", "Seamless ERP integration"],
    icon: "ShoppingCart"
  },
  {
    productId: "1xcess",
    name: "1Xcess",
    tagline: "Excess Inventory Monetization",
    description: "eBay for Components. Structured liquidation of excess and EOL inventory through competitive bidding with approved buyers.",
    features: ["Approved buyers with global reach", "Competitive bidding & transparency", "Reverse auctions for best pricing", "Escrow + QA for trust"],
    icon: "RefreshCw"
  }
];

const HomePage = () => {
  const [heroData, setHeroData] = useState(defaultHeroData);
  const [stats, setStats] = useState(defaultStats);
  const [customers, setCustomers] = useState(defaultCustomers);
  const [products, setProducts] = useState(defaultProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        // Fetch all content in parallel
        const [heroRes, statsRes, customersRes, productsRes] = await Promise.all([
          axios.get(`${API}/hero-section`).catch(() => ({ data: null })),
          axios.get(`${API}/site-stats`).catch(() => ({ data: [] })),
          axios.get(`${API}/customer-logos`).catch(() => ({ data: [] })),
          axios.get(`${API}/products`).catch(() => ({ data: [] }))
        ]);

        // Update hero data if available
        if (heroRes.data && heroRes.data.headline) {
          setHeroData(heroRes.data);
        }

        // Update stats if available
        if (statsRes.data && statsRes.data.length > 0) {
          setStats(statsRes.data);
        }

        // Update customers if available
        if (customersRes.data && customersRes.data.length > 0) {
          setCustomers(customersRes.data.map(c => c.name));
        }

        // Update products if available
        if (productsRes.data && productsRes.data.length > 0) {
          setProducts(productsRes.data);
        }
      } catch (error) {
        console.error('Error fetching site content:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteContent();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 text-emerald-700 border-emerald-200 bg-emerald-50">
              The Operating System for Electronics Procurement
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              {heroData.headline}
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl">
              {heroData.subHeadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12">
                  {heroData.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <DemoVideoModal variant="outline" className="border-slate-300 text-slate-700 px-8 h-12" />
            </div>
          </div>

          {/* Trusted By - Customer Logos - Full Width Centered */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-800 text-base font-semibold mb-4">
              Trusted by leading OEMs and EMS companies worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
              {customers.slice(0, 8).map((customer, index) => (
                <span key={index} className="text-slate-400 font-semibold text-base hover:text-slate-600 transition-colors">
                  {customer}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Screenshot */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200">
            <img
              src={heroData.screenshotUrl}
              alt="1Buy.AI Platform Dashboard"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Proof Points - Compact Stats Bar */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.key || index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-white font-medium mb-1">{stat.label}</div>
                <div className="text-slate-400 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-slate-600 border-slate-300">
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Procurement teams are flying blind
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Accountable for outcomes but lacking decision-grade tools. Distributors have conflict of interest. There's no independent benchmark.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemsData.map((problem) => {
              const IconComponent = iconMap[problem.icon];
              return (
                <Card key={problem.id} className="border-slate-200 hover:border-slate-300 transition-colors hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Flow */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              From BOM to better decisions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              No rip-and-replace. Minimal disruption. Clear ROI before scale-up.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {workflowSteps.map((step, index) => {
                const IconComponent = iconMap[step.icon];
                return (
                  <div key={step.step} className="relative">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all h-full">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                        {step.step}
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-slate-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                        <ChevronRight className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
              Our Platform
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Three integrated pillars
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Intelligence → Procurement → Liquidation. Built as one unified operating system.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const IconComponent = iconMap[product.icon] || Database;
              const colors = [
                { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
                { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
                { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' }
              ];
              return (
                <Card key={product.productId || product.id} className={`border-2 ${colors[index % 3].border} hover:shadow-xl transition-all`}>
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl ${colors[index % 3].bg} flex items-center justify-center mb-6`}>
                      <IconComponent className={`h-7 w-7 ${colors[index % 3].icon}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-emerald-600 font-medium mb-4">
                      {product.tagline}
                    </p>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    <ul className="space-y-3 mb-6">
                      {(product.features || []).slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/products#${product.productId}`}>
                      <Button variant="outline" className="w-full border-slate-300">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Network Map */}
      <GlobalNetworkMap />

      {/* Mental Model Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
              Think of it as
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl">
              <div className="flex items-center">
                <span className="font-semibold text-blue-600">Bloomberg</span>
                <span className="text-slate-400 ml-2">(1Data)</span>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-400 hidden md:block" />
              <div className="h-6 w-px bg-slate-300 md:hidden" />
              <div className="flex items-center">
                <span className="font-semibold text-emerald-600">Amazon</span>
                <span className="text-slate-400 ml-2">(1Source)</span>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-400 hidden md:block" />
              <div className="h-6 w-px bg-slate-300 md:hidden" />
              <div className="flex items-center">
                <span className="font-semibold text-amber-600">eBay</span>
                <span className="text-slate-400 ml-2">(1Xcess)</span>
              </div>
            </div>
            <p className="text-slate-600 mt-6 text-lg">
              For electronic components
            </p>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <DemoVideoSection />

      {/* Testimonials Marquee */}
      <TestimonialsMarquee />

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your procurement?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start with your BOM. See potential savings within days, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12">
                Request a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 h-12">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
