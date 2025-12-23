import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useCasesData, proofPointsData } from '../data/mock';
import {
  Zap,
  Activity,
  Settings,
  Smartphone,
  ArrowRight,
  Building2,
  Factory,
  CheckCircle,
  Users,
  Globe,
  Target
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const iconMap = {
  Zap,
  Activity,
  Settings,
  Smartphone
};

const UseCasesPage = () => {
  const customerTypes = [
    {
      type: 'OEMs',
      icon: Building2,
      description: 'Original Equipment Manufacturers managing complex multi-tier supply chains',
      benefits: [
        'Benchmark component pricing across global suppliers',
        'Proactive lifecycle and obsolescence management',
        'Defensible procurement decisions with audit trails',
        'Reduce BOM costs by 10-20%'
      ]
    },
    {
      type: 'EMS Players',
      icon: Factory,
      description: 'Electronics Manufacturing Services companies serving multiple OEM customers',
      benefits: [
        'Aggregate demand intelligence across customer programs',
        'Faster RFQ responses with competitive pricing',
        'Better margin management through price benchmarks',
        'Structured excess inventory liquidation'
      ]
    }
  ];

  const testimonials = [
    {
      quote: "We're flying blind — no data to audit procurement. We can't verify if we're sourcing at the right price or overpaying.",
      role: "CEO",
      company: "Napino Industries"
    },
    {
      quote: "Even billion-dollar teams don't have real-time visibility. Component pricing, new introductions, tariffs — it's all dynamic and stressful.",
      role: "Sourcing Lead",
      company: "Google Supply Chain"
    },
    {
      quote: "We're losing capital to dead stock. Quarterly piles of excess components with no transparent channel to liquidate.",
      role: "COO",
      company: "Leading Listed EMS"
    }
  ];

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
              <Target className="w-3 h-3 animate-pulse" />
              Use Cases
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Built for OEMs and EMS players
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              From electric vehicles to smart meters, 1Buy.AI serves procurement teams across high BOM-sensitivity industries worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Types */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {customerTypes.map((customer, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:border-emerald-200 transition-colors">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                    <customer.icon className="h-7 w-7 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{customer.type}</h3>
                  <p className="text-slate-600 mb-6">{customer.description}</p>
                  <ul className="space-y-3">
                    {customer.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Verticals */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              High BOM-sensitivity industries
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Where component costs and risks significantly impact business outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCasesData.map((useCase, index) => {
              const IconComponent = iconMap[useCase.icon];
              return (
                <Card key={index} className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {useCase.industry}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Voices */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What customers are saying
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Stories from the frontline of electronics procurement.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-50 border-0">
                <CardContent className="p-8">
                  <div className="text-4xl text-emerald-600 mb-4">“</div>
                  <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.role}</p>
                    <p className="text-slate-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Fair access to intelligence
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Large OEMs have better supplier visibility, alternate sourcing, and pricing. 1Buy.AI levels the playing field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Users className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">For Large OEMs</h3>
                <p className="text-slate-400">Consolidate procurement intelligence across divisions and programs</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Factory className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">For Mid-Size EMS</h3>
                <p className="text-slate-400">Access enterprise-grade intelligence without enterprise budgets</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Globe className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">For SME Players</h3>
                <p className="text-slate-400">Level the playing field with data previously only available to giants</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 font-medium mb-8">
            Active engagements with leading companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {proofPointsData.customers.map((customer, index) => (
              <div key={index} className="text-slate-400 font-semibold text-lg hover:text-slate-600 transition-colors">
                {customer}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
            See what 1Buy.AI can do for you
          </h2>
          
          {/* White box container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-slate-600 mb-8">
              Whether you&apos;re a billion-dollar OEM or an emerging EMS player, we can help.
            </p>
            <div className="flex justify-center">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30"
                >
                  <span className="relative z-10 flex items-center">
                    Talk to Our Team
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UseCasesPage;
