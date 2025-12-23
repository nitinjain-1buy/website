import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { aboutData } from '../data/mock';
import {
  ArrowRight,
  Target,
  Users,
  Shield,
  Zap,
  Database,
  Globe,
  Award
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const iconMap = {
  'Data-First': Database,
  'Customer-Centric': Users,
  'Execution-Focused': Zap,
  'Trust & Transparency': Shield
};

const AboutPage = () => {
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
              About 1Buy.AI
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Building the operating system for electronics procurement
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We&apos;re on a mission to make global electronics procurement intelligent, transparent, and optimized for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {aboutData.mission}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <Globe className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {aboutData.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The $2.3T problem
            </h2>
            <p className="text-xl text-slate-600">
              Electronics manufacturing supply chain is complex and lacks transparency, creating massive inefficiencies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">$2.3T</div>
                <p className="text-slate-600">Global electronics procurement market</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">37K+</div>
                <p className="text-slate-600">Global OEMs and EMS companies</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">15%</div>
                <p className="text-slate-600">Global market CAGR</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-200 bg-emerald-50">
                Leadership
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Built by operators, for operators
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our founding team brings together rare expertise in enterprise SaaS, data platforms, and large-scale supply chains. We've built and scaled companies before — and we understand the problem firsthand.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="text-slate-700">IIT Delhi & Harvard Business School alumni</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="text-slate-700">Deep experience in enterprise SaaS and data platforms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="text-slate-700">Previously co-founded and built unicorns</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="text-slate-700">Hands-on experience with large-scale supply chains</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-white mb-6">Why We're Different</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Operators, Not Just Technologists</h4>
                    <p className="text-slate-400">We've lived the procurement problem, not just studied it</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Full-Stack Thinking</h4>
                    <p className="text-slate-400">Intelligence alone isn't enough — execution matters</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Data Obsession</h4>
                    <p className="text-slate-400">Building proprietary data moat that compounds over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our values
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Principles that guide how we build and operate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.values.map((value, index) => {
              const IconComponent = iconMap[value.title];
              return (
                <Card key={index} className="border-slate-200 hover:border-emerald-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
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
            Join us in transforming procurement
          </h2>
          
          {/* White box container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-slate-600 mb-8">
              Whether you&apos;re a potential customer, partner, or team member — we&apos;d love to hear from you.
            </p>
            <div className="flex justify-center">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/30"
                >
                  <span className="relative z-10 flex items-center">
                    Get in Touch
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

export default AboutPage;
