import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { workflowSteps } from '../data/mock';
import {
  Upload,
  Search,
  CheckCircle,
  Zap,
  DollarSign,
  ArrowRight,
  ArrowDown,
  Monitor,
  Settings,
  BarChart3,
  RefreshCw,
  Sparkles,
  Cog
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const iconMap = {
  Upload,
  Search,
  CheckCircle,
  Zap,
  DollarSign
};

const HowItWorksPage = () => {
  const detailedSteps = [
    {
      ...workflowSteps[0],
      details: [
        'Upload your Bill of Materials in any standard format (Excel, CSV)',
        'Or connect directly to your ERP via API integration',
        'Platform automatically normalizes and validates component data',
        'No IT overhead — start analyzing within minutes'
      ],
      outcome: 'Your BOM data is normalized and ready for analysis'
    },
    {
      ...workflowSteps[1],
      details: [
        'AI analyzes each line item against global pricing data',
        'Automatically identifies pricing gaps vs market benchmarks',
        'Discovers qualified alternates (form/fit/function)',
        'Flags lifecycle, EOL, and supplier risks'
      ],
      outcome: 'Clear visibility into savings opportunities and risks'
    },
    {
      ...workflowSteps[2],
      details: [
        'Review prioritized recommendations based on impact',
        'Run what-if scenarios and simulations',
        'Choose to renegotiate with current suppliers',
        'Or decide to re-source or hold positions'
      ],
      outcome: 'Defensible, data-backed procurement decisions'
    },
    {
      ...workflowSteps[3],
      details: [
        'Execute sourcing through vetted global suppliers',
        'Compare landed costs across regions',
        'Streamlined RFQ workflows for faster cycles',
        'You stay in control — we execute where it matters'
      ],
      outcome: 'Optimized sourcing at competitive prices'
    },
    {
      ...workflowSteps[4],
      details: [
        'List excess and EOL inventory on 1Xcess',
        'Access approved buyers with global reach',
        'Competitive bidding ensures best prices',
        'Escrow + QA for secure, trusted transactions'
      ],
      outcome: 'Dead stock converted to working capital'
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
              <Sparkles className="w-3 h-3 animate-pulse" />
              How It Works
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              From BOM to better decisions in 5 steps
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              No rip-and-replace. No complex implementation. Start small, prove value, then scale. Clear ROI before commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {detailedSteps.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            const colors = [
              { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200', num: 'bg-blue-600' },
              { bg: 'bg-cyan-50', icon: 'text-cyan-600', border: 'border-cyan-200', num: 'bg-cyan-600' },
              { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200', num: 'bg-emerald-600' },
              { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200', num: 'bg-amber-600' },
              { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-200', num: 'bg-rose-600' }
            ];

            return (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < detailedSteps.length - 1 && (
                  <div className="absolute left-[39px] top-[120px] bottom-0 w-0.5 bg-slate-200" style={{ height: 'calc(100% - 80px)' }} />
                )}

                <div className="flex gap-8 mb-16">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl ${colors[index].num} text-white flex items-center justify-center`}>
                      <span className="text-3xl font-bold">{step.step}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${colors[index].bg} flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${colors[index].icon}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                    </div>

                    <p className="text-lg text-slate-600 mb-6">
                      {step.description}
                    </p>

                    <Card className={`border-2 ${colors[index].border} mb-4`}>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-slate-900 mb-4">What happens:</h4>
                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className={`h-5 w-5 ${colors[index].icon} mr-3 flex-shrink-0 mt-0.5`} />
                              <span className="text-slate-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className={`${colors[index].bg} rounded-lg px-4 py-3 inline-flex items-center`}>
                      <ArrowRight className={`h-5 w-5 ${colors[index].icon} mr-2`} />
                      <span className={`font-medium ${colors[index].icon}`}>Outcome: {step.outcome}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Down */}
                {index < detailedSteps.length - 1 && (
                  <div className="flex justify-center mb-8">
                    <ArrowDown className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pilot Section - Dark background */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-emerald-400 border-emerald-400/50 bg-emerald-400/10">
                Start Small
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                What a pilot looks like
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                We don&apos;t ask for commitment upfront. Start with 10-30 parts, see measurable results, then decide to scale.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Week 1: Data Onboarding</h4>
                    <p className="text-slate-400">Upload sample BOM data (10-30 parts)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Week 2: Analysis</h4>
                    <p className="text-slate-400">Receive detailed savings and risk report</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Monitor className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Week 3: Review</h4>
                    <p className="text-slate-400">Walk through findings with our team</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Week 4+: Decide</h4>
                    <p className="text-slate-400">Scale up based on proven ROI</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-white mb-6">Typical Pilot Results</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-2xl">$14.77M</h4>
                    <p className="text-slate-400">Potential savings identified</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-2xl">15-20%</h4>
                    <p className="text-slate-400">Average savings on analyzed parts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-2xl">100%</h4>
                    <p className="text-slate-400">MPN match rate</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-2xl">2 Weeks</h4>
                    <p className="text-slate-400">Time to initial results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Same style as HomePage */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
            Ready to transform your procurement?
          </h2>
          
          {/* White box container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-slate-600 mb-8">
              Start with your BOM. See potential savings within days, not months.
            </p>
            <div className="flex justify-center">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30"
                >
                  <span className="relative z-10 flex items-center">
                    Request a Demo
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

export default HowItWorksPage;
