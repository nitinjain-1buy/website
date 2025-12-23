import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { productsData } from '../data/mock';
import {
  Database,
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const iconMap = {
  Database,
  ShoppingCart,
  RefreshCw
};

const ProductsPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  const productDetails = {
    '1data': {
      hero: 'Bloomberg for Components',
      subtitle: 'Independent global price benchmarks, alternate discovery, and risk intelligence.',
      keyBenefits: [
        { icon: BarChart3, title: 'Price Benchmarks', description: 'Real-time global pricing intelligence across 25M+ MPNs' },
        { icon: Shield, title: 'Risk Alerts', description: 'Proactive lifecycle, EOL, and supplier risk notifications' },
        { icon: Globe, title: 'Alternate Discovery', description: 'Form/fit/function alternate identification' },
        { icon: Zap, title: 'AI Predictions', description: 'ML-powered price predictions and simulations' }
      ],
      useCases: [
        'Benchmark distributor quotes against market data',
        'Identify 10-20% savings opportunities on your BOM',
        'Proactively manage lifecycle and obsolescence risk',
        'Run what-if scenarios before making sourcing decisions'
      ],
      screenshot: 'https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/te8eq0cr_image-3.png'
    },
    '1source': {
      hero: 'Amazon for Procurement',
      subtitle: 'Execute sourcing where it matters most with vetted global suppliers.',
      keyBenefits: [
        { icon: Globe, title: 'Global Network', description: 'Vetted suppliers across CN, IN, TW, KR, EU, US' },
        { icon: DollarSign, title: 'Landed Cost', description: 'Transparent pricing with duties, FX, logistics, tariffs' },
        { icon: Clock, title: 'Faster RFQs', description: 'Streamlined workflows for quicker decisions' },
        { icon: Shield, title: 'You Stay in Control', description: 'We execute, you decide' }
      ],
      useCases: [
        'Source high-impact components with confidence',
        'Compare landed costs across global suppliers',
        'Reduce RFQ cycle time by 40%',
        'Maintain control while accessing global network'
      ],
      screenshot: 'https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/zedmi29e_Output.png'
    },
    '1xcess': {
      hero: 'eBay for Components',
      subtitle: 'Structured liquidation of excess and EOL inventory.',
      keyBenefits: [
        { icon: Globe, title: 'Global Buyers', description: 'Approved buyers with worldwide reach' },
        { icon: BarChart3, title: 'Competitive Bidding', description: 'Reverse auctions for best pricing' },
        { icon: Shield, title: 'Trust & Escrow', description: 'Escrow + QA for secure transactions' },
        { icon: DollarSign, title: 'Faster Recovery', description: 'Turn dead stock into working capital' }
      ],
      useCases: [
        'Liquidate excess inventory at competitive prices',
        'Recover value from EOL components',
        'Reduce working capital lock-up',
        'Access transparent, competitive marketplace'
      ],
      screenshot: 'https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/jm3krz17_Risk_centre.png'
    }
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 py-20">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
              Our Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Three pillars. One unified operating system.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              1Buy.AI combines intelligence, execution, and liquidity — from pricing insights to seamless sourcing to excess inventory monetization.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      {productsData.map((product, index) => {
        const IconComponent = iconMap[product.icon];
        const details = productDetails[product.id];
        const isReverse = index % 2 === 1;
        const colors = [
          { accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { accent: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
        ];

        return (
          <section
            key={product.id}
            id={product.id}
            className={`py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-16 items-center ${isReverse ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className={isReverse ? 'lg:order-2' : ''}>
                  <div className={`w-14 h-14 rounded-xl ${colors[index].bg} flex items-center justify-center mb-6`}>
                    <IconComponent className={`h-7 w-7 ${colors[index].accent}`} />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-2">
                    {product.name}
                  </h2>
                  <p className={`text-xl ${colors[index].accent} font-medium mb-4`}>
                    {details.hero}
                  </p>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {details.subtitle}
                  </p>

                  {/* Key Benefits Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {details.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${colors[index].bg} flex items-center justify-center flex-shrink-0`}>
                          <benefit.icon className={`h-5 w-5 ${colors[index].accent}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{benefit.title}</h4>
                          <p className="text-sm text-slate-600">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-900 mb-3">Use Cases</h4>
                    <ul className="space-y-2">
                      {details.useCases.map((useCase, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className={`h-5 w-5 ${colors[index].accent} mr-2 flex-shrink-0 mt-0.5`} />
                          <span className="text-slate-700">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/contact">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      Get Started with {product.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Screenshot */}
                <div className={isReverse ? 'lg:order-1' : ''}>
                  <div className={`rounded-xl overflow-hidden shadow-2xl border ${colors[index].border}`}>
                    <img
                      src={details.screenshot}
                      alt={`${product.name} Interface`}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Integration Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Seamless integration with your workflows
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Connect 1Buy.AI to your existing ERP, PLM, and procurement systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'ERP Integration', description: 'SAP, Oracle, and custom ERP connectors' },
              { title: 'PLM Connectivity', description: 'Altium, Cadence, and design tool integration' },
              { title: 'API Access', description: 'RESTful APIs for custom workflows' }
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Start with your BOM
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            See how 1Buy.AI can identify savings and reduce risk for your organization.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 px-8 h-12">
              Request a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
