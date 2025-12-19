import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { whyData } from '../data/mock';
import {
  Check,
  X,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Shield,
  Layers,
  Database,
  Zap
} from 'lucide-react';

const WhyPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
              Why 1Buy.AI
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Intelligence + Execution + Liquidity
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              No other platform combines decision-grade data, sourcing execution, and inventory liquidation. That's why leading OEMs and EMS companies choose 1Buy.AI.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem with Alternatives */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The problem with current options
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Existing solutions are fragmented, conflicted, or incomplete.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {whyData.differentiators.map((item, index) => (
              <Card
                key={index}
                className={`border-2 ${
                  index === 2 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                }`}
              >
                <CardContent className="p-8">
                  <h3 className={`text-xl font-bold mb-6 ${
                    index === 2 ? 'text-emerald-700' : 'text-slate-900'
                  }`}>
                    {item.title}
                  </h3>
                  <ul className="space-y-4">
                    {item.points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        {index === 2 ? (
                          <Check className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={index === 2 ? 'text-emerald-800' : 'text-slate-700'}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How we compare
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              1Buy.AI is the only platform offering intelligence, execution, and liquidation in one.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-4 px-6 text-left font-semibold">Capability</th>
                  <th className="py-4 px-6 text-center font-semibold">
                    <span className="flex items-center justify-center">
                      <span className="text-emerald-400">1Buy.AI</span>
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold">Lytica</th>
                  <th className="py-4 px-6 text-center font-semibold">Distributors</th>
                  <th className="py-4 px-6 text-center font-semibold">Marketplaces</th>
                </tr>
              </thead>
              <tbody>
                {whyData.comparison.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-4 px-6 font-medium text-slate-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {row.onebuy ? (
                        <Check className="h-6 w-6 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.lytica ? (
                        <Check className="h-6 w-6 text-slate-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.distributors ? (
                        <Check className="h-6 w-6 text-slate-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.marketplaces ? (
                        <Check className="h-6 w-6 text-slate-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Data Moat */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
                Our Data Moat
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Proprietary data that keeps you safe
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our intelligence is built on 400+ proprietary data pipes, including customs data, distributor APIs, client BOM uploads, and PCN/EOL databases. This data compounds over time, creating a moat that's hard to replicate.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Database, title: '25M+ MPNs', description: 'Comprehensive part number coverage' },
                  { icon: Shield, title: 'Defensible & Auditable', description: 'Every decision backed by data you can verify' },
                  { icon: TrendingUp, title: 'Compounding Intelligence', description: 'More data → better insights → more customers' },
                  { icon: Layers, title: 'Multiple Data Layers', description: 'Price, risk, alternates, compliance in one view' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-white mb-8">The Flywheel Effect</h3>
              <div className="space-y-6">
                {[
                  'Every new OEM/EMS integration brings more BOMs and transaction data',
                  'More data creates better pricing benchmarks and predictions',
                  'Better intelligence attracts more customers',
                  'Loop reinforces itself — data moat compounds'
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See the difference for yourself
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start with a pilot. Identify savings on 10-30 parts before committing.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12">
              Start a Pilot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default WhyPage;
