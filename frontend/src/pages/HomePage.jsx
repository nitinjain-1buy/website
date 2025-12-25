import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import SEO from '../components/SEO';
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
  Play,
  Sparkles,
  Cog
} from 'lucide-react';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';
import GlobalNetworkMap from '../components/GlobalNetworkMap';
import AnimatedSection from '../components/AnimatedSection';
import AnimatedCounter from '../components/AnimatedCounter';
import TypewriterText from '../components/TypewriterText';
import AnimatedCard from '../components/AnimatedCard';
import useScrollAnimation from '../hooks/useScrollAnimation';

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
  headline: "Decision-grade AI driven intelligence for electronics procurement",
  subHeadline: "From pricing and risk to execution and liquidation — the operating system for electronics procurement.",
  ctaPrimary: "Request a Demo",
  ctaSecondary: "Talk to Our Team",
  screenshotUrl: "https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/zedmi29e_Output.png"
};

const defaultStats = [
  { value: "15-20%", label: "Cost Savings Realised", description: "Average savings realised across customer BOMs" },
  { value: "25M+", label: "MPN Coverage", description: "Comprehensive part number database" },
  { value: "400+", label: "Data Sources", description: "Proprietary data pipes for intelligence" },
  { value: "30+", label: "Enterprise Customers", description: "Active OEM & EMS engagements" },
  { value: "500M+", label: "Data Points", description: "Real-time market intelligence signals processed daily" }
];

const defaultCustomers = [
  "Google", "Uno Minda", "Dixon", "Napino", "SGS Syrma", "NCR Atleos", "Lucas TVS", "Lumax", "Bajaj"
];

const defaultProblems = [
  {
    id: 1,
    title: "No Price Confidence",
    description: "Prices decided via RFQs and distributor quotes with no independent benchmark. Relationship-driven pricing leaves you uncertain if you're overpaying.",
    icon: "TrendingDown"
  },
  {
    id: 2,
    title: "BOM Complexity",
    description: "Heavy use of Excel and email. Unable to consistently optimize pricing and risk for large, complex BOMs across vendors and regions.",
    icon: "Layers"
  },
  {
    id: 3,
    title: "Alternate & Lifecycle Risk",
    description: "Hard to find qualified alternates quickly. Lifecycle, EOL, and supplier risk discovered too late, causing disruptions.",
    icon: "AlertTriangle"
  },
  {
    id: 4,
    title: "Excess Inventory Lock-up",
    description: "Components become excess or obsolete with no structured way to liquidate at the right price. Pure working-capital loss.",
    icon: "Package"
  }
];

const defaultWorkflowSteps = [
  {
    step: 1,
    title: "Upload BOM",
    description: "Connect your ERP or simply upload your Bill of Materials. Our platform ingests and normalizes your component data instantly.",
    icon: "Upload"
  },
  {
    step: 2,
    title: "Identify",
    description: "AI analyzes pricing gaps, qualified alternates, and risks across your entire BOM. Savings opportunities are highlighted automatically.",
    icon: "Search"
  },
  {
    step: 3,
    title: "Decide",
    description: "Armed with decision-grade intelligence, choose to renegotiate with current suppliers, re-source, or hold positions.",
    icon: "CheckCircle"
  },
  {
    step: 4,
    title: "Execute",
    description: "For high-impact components, execute sourcing through 1Source with vetted global suppliers and transparent pricing.",
    icon: "Zap"
  },
  {
    step: 5,
    title: "Liquidate",
    description: "Turn excess and EOL inventory into cash through 1Xcess with approved buyers and competitive bidding.",
    icon: "DollarSign"
  }
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

// Animated Stats Component
const AnimatedStat = ({ stat, index }) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.3 });
  
  return (
    <div 
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-2">
        {isVisible ? (
          <AnimatedCounter end={stat.value} duration={2000} />
        ) : (
          <span>0</span>
        )}
      </div>
      <div className="text-white font-medium mb-1">{stat.label}</div>
      <div className="text-slate-400 text-sm">{stat.description}</div>
    </div>
  );
};

const HomePage = () => {
  const [heroData, setHeroData] = useState(defaultHeroData);
  const [stats, setStats] = useState(defaultStats);
  const [customers, setCustomers] = useState(defaultCustomers);
  const [products, setProducts] = useState(defaultProducts);
  const [problems, setProblems] = useState(defaultProblems);
  const [workflowSteps, setWorkflowSteps] = useState(defaultWorkflowSteps);
  const [isLoading, setIsLoading] = useState(true);
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    showClientNames: null, // Start as null to prevent flash - only show when API confirms
    clientSectionTitle: "Trusted by leading OEMs and EMSs of the world",
    clientSectionSubtitle: "Built for procurement leaders who demand precision",
    targetAudience: ["CEOs & Owners", "Chief Procurement Officers", "Chief Financial Officers", "Sourcing Teams"]
  });

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        // Fetch all content in parallel
        const [heroRes, statsRes, customersRes, productsRes, settingsRes, problemsRes, workflowRes] = await Promise.all([
          axios.get(`${API}/hero-section`).catch(() => ({ data: null })),
          axios.get(`${API}/site-stats`).catch(() => ({ data: [] })),
          axios.get(`${API}/customer-logos`).catch(() => ({ data: [] })),
          axios.get(`${API}/products`).catch(() => ({ data: [] })),
          axios.get(`${API}/site-settings`).catch(() => ({ data: null })),
          axios.get(`${API}/problems`).catch(() => ({ data: [] })),
          axios.get(`${API}/workflow-steps`).catch(() => ({ data: [] }))
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

        // Update problems if available
        if (problemsRes.data && problemsRes.data.length > 0) {
          setProblems(problemsRes.data);
        }

        // Update workflow steps if available
        if (workflowRes.data && workflowRes.data.length > 0) {
          setWorkflowSteps(workflowRes.data);
        }

        // Update site settings if available
        if (settingsRes.data) {
          setSiteSettings({
            ...siteSettings,
            ...settingsRes.data,
            targetAudience: settingsRes.data.targetAudience || ["CEOs & Owners", "Chief Procurement Officers", "Chief Financial Officers", "Sourcing Teams"]
          });
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
    <div className="bg-white overflow-x-hidden">
      <SEO 
        title="1BUY.AI | AI-Powered Electronics Procurement Intelligence"
        description="Decision-grade AI driven intelligence for electronics procurement. Real-time market intelligence, risk analysis, and supply chain insights for the semiconductor industry."
        keywords="electronics procurement, semiconductor intelligence, supply chain risk, BOM analysis, component sourcing, AI procurement"
        url="/"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-emerald-400/30 rounded-full animate-floating-dots" />
          <div className="absolute top-40 right-[20%] w-3 h-3 bg-blue-400/20 rounded-full animate-floating-dots" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-[30%] w-2 h-2 bg-emerald-500/20 rounded-full animate-floating-dots" style={{ animationDelay: '2s' }} />
          <div className="absolute top-60 right-[40%] w-1.5 h-1.5 bg-slate-400/30 rounded-full animate-floating-dots" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            {/* Animated Badge */}
            <AnimatedSection animation="fade-down" delay={0}>
              <Badge 
                variant="outline" 
                className="mb-6 text-emerald-700 border-emerald-200 bg-emerald-50 animate-badge-pulse inline-flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 animate-pulse" />
                The Operating System for Electronics Procurement
              </Badge>
            </AnimatedSection>

            {/* Typewriter Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6 min-h-[120px] lg:min-h-[144px]">
              <TypewriterText 
                text={heroData.headline}
                speed={40}
                delay={300}
                onComplete={() => setHeadlineComplete(true)}
              />
            </h1>

            {/* Sub-headline with fade-in after typewriter */}
            <p 
              className={`text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl transition-all duration-700 ${
                headlineComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {heroData.subHeadline}
            </p>

            {/* CTA Button with glow effect */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
                headlineComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20"
                >
                  <span className="relative z-10 flex items-center">
                    {heroData.ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By - Customer Logos - Separate white section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {siteSettings.clientSectionTitle}
            </h2>
            
            {/* Target Audience - Elegant Design */}
            <div className="mb-8">
              <p className="text-xl sm:text-2xl text-slate-600 font-light mb-4">
                {siteSettings.clientSectionSubtitle || "Built for procurement leaders who demand precision"}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {(siteSettings.targetAudience || []).map((audience, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm sm:text-base font-medium border border-slate-200"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Only show client names if explicitly enabled (not null, not false) */}
            {siteSettings.showClientNames === true && (
              <div className="relative overflow-hidden py-4">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
                
                {/* Scrolling Content */}
                <div className="flex animate-marquee whitespace-nowrap">
                  {/* First set */}
                  {customers.map((customer, index) => (
                    <span 
                      key={`first-${index}`} 
                      className="text-xl text-slate-400 font-semibold mx-8 hover:text-slate-600 transition-colors"
                    >
                      {customer}
                    </span>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {customers.map((customer, index) => (
                    <span 
                      key={`second-${index}`} 
                      className="text-xl text-slate-400 font-semibold mx-8 hover:text-slate-600 transition-colors"
                    >
                      {customer}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Product Screenshot Section */}
      <section className="relative overflow-hidden bg-slate-50 py-16">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <AnimatedSection animation="zoom-in" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 hover-lift">
            <img
              src={heroData.screenshotUrl}
              alt="1Buy.AI Platform Dashboard"
              className="w-full"
            />
            {/* Subtle overlay glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
          </div>
        </AnimatedSection>
      </section>

      {/* Proof Points - Compact Stats Bar */}
      <section className="bg-slate-900 py-12 relative overflow-hidden">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {stats.map((stat, index) => (
              <AnimatedStat key={stat.key || index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background - same as hero */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50 animate-badge-pulse inline-flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Procurement teams are flying blind
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Accountable for outcomes but lacking decision-grade tools. Distributors have conflict of interest. There&apos;s no independent benchmark.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => {
              const IconComponent = iconMap[problem.icon];
              return (
                <AnimatedCard 
                  key={problem.id} 
                  delay={index * 100}
                  hoverEffect="lift"
                  className="border-slate-200 bg-white"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </CardContent>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Flow - Plain white background for contrast */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50 animate-badge-pulse inline-flex items-center gap-2">
              <Cog className="w-3 h-3 animate-spin-slow" />
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              From BOM to better decisions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              No rip-and-replace. Minimal disruption. Clear ROI before scale-up.
            </p>
          </AnimatedSection>

          <div className="relative">
            {/* Animated connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shimmer" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {workflowSteps.map((step, index) => {
                const IconComponent = iconMap[step.icon];
                return (
                  <AnimatedSection 
                    key={step.step} 
                    animation="fade-up"
                    delay={index * 150}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all h-full hover:-translate-y-2 group">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4 group-hover:animate-pulse-glow transition-all">
                        {step.step}
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                        <IconComponent className="h-6 w-6 text-slate-700 group-hover:text-emerald-600 transition-colors" />
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
                        <ChevronRight className="h-6 w-6 text-emerald-500 animate-subtle-bounce" />
                      </div>
                    )}
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50 animate-badge-pulse inline-flex items-center gap-2">
              <Layers className="w-3 h-3 animate-pulse" />
              Our Platform
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Three integrated pillars
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Intelligence → Procurement → Liquidation. Built as one unified operating system.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const IconComponent = iconMap[product.icon] || Database;
              const colors = [
                { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', hover: 'hover:border-blue-300 hover:shadow-blue-100/50' },
                { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', hover: 'hover:border-emerald-300 hover:shadow-emerald-100/50' },
                { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100', hover: 'hover:border-amber-300 hover:shadow-amber-100/50' }
              ];
              return (
                <AnimatedCard 
                  key={product.productId || product.id} 
                  delay={index * 150}
                  hoverEffect="glow"
                  className={`border-2 bg-white ${colors[index % 3].border} ${colors[index % 3].hover}`}
                >
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl ${colors[index % 3].bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
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
                        <li key={idx} className="flex items-start group/item">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5 transition-transform group-hover/item:scale-110" />
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/products#${product.productId}`}>
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-300 group/btn hover:border-slate-400 transition-all"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Network Map */}
      <GlobalNetworkMap />

      {/* Mental Model Section - with pattern background */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="zoom-in" className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
              Think of it as
            </h2>
            {/* White box container */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl">
                <AnimatedSection animation="fade-right" delay={200} className="flex items-center">
                  <span className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Bloomberg</span>
                  <span className="text-slate-400 ml-2">(1Data)</span>
                </AnimatedSection>
                <ArrowRight className="h-6 w-6 text-slate-400 hidden md:block animate-subtle-bounce" />
                <div className="h-6 w-px bg-slate-300 md:hidden" />
                <AnimatedSection animation="fade-up" delay={400} className="flex items-center">
                  <span className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Amazon</span>
                  <span className="text-slate-400 ml-2">(1Source)</span>
                </AnimatedSection>
                <ArrowRight className="h-6 w-6 text-slate-400 hidden md:block animate-subtle-bounce" style={{ animationDelay: '0.5s' }} />
                <div className="h-6 w-px bg-slate-300 md:hidden" />
                <AnimatedSection animation="fade-left" delay={600} className="flex items-center">
                  <span className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">eBay</span>
                  <span className="text-slate-400 ml-2">(1Xcess)</span>
                </AnimatedSection>
              </div>
              <AnimatedSection animation="fade-up" delay={800}>
                <p className="text-slate-600 mt-6 text-lg">
                  For electronic components
                </p>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <TestimonialsMarquee />

      {/* CTA Section - White background with electronic components */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
              Ready to transform your procurement?
            </h2>
          </AnimatedSection>
          
          {/* White box container */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-8 md:p-12 max-w-3xl mx-auto">
              <p className="text-xl text-slate-600 mb-8">
                Start with your BOM. See potential savings within days, not months.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button 
                    size="lg" 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30"
                  >
                    <span className="relative z-10 flex items-center">
                      Request a Demo
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-300 text-slate-900 hover:bg-slate-100 px-8 h-12 transition-all duration-300 hover:scale-105"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
