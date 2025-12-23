import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { teamData } from '../data/mock';
import {
  Linkedin,
  ArrowRight,
  Award,
  Users,
  Building2,
  GraduationCap
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const TeamPage = () => {
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
              Our Team
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Built by operators, for operators
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Our founding team brings together rare expertise in enterprise SaaS, data platforms, and large-scale supply chains. We've lived the procurement problem, not just studied it.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Founders
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experienced entrepreneurs building the future of electronics procurement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamData.founders.map((founder, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:border-emerald-200 transition-all hover:shadow-xl">
                <CardContent className="p-8">
                  {/* Avatar Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl font-bold text-white">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {founder.name}
                    </h3>
                    <p className="text-emerald-600 font-medium mb-2">
                      {founder.role}
                    </p>
                    {founder.education && (
                      <p className="text-slate-500 text-sm mb-4">
                        {founder.education}
                      </p>
                    )}
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                      {founder.bio}
                    </p>
                    {founder.expertise && (
                      <div className="bg-slate-50 rounded-lg px-4 py-2 mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Expertise</p>
                        <p className="text-slate-700 text-sm font-medium">{founder.expertise}</p>
                      </div>
                    )}

                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-slate-600 hover:text-emerald-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5 mr-2" />
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Credentials */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why our team is different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">IIT Delhi & HBS</h3>
                <p className="text-slate-600 text-sm">World-class education from top institutions</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Unicorn Builders</h3>
                <p className="text-slate-600 text-sm">Previously co-founded and scaled unicorns</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Enterprise SaaS</h3>
                <p className="text-slate-600 text-sm">Deep expertise in B2B software at scale</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Supply Chain Ops</h3>
                <p className="text-slate-600 text-sm">Hands-on experience with large-scale operations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl text-emerald-500 mb-6">"</div>
          <blockquote className="text-2xl sm:text-3xl text-white font-light leading-relaxed mb-8">
            We've lived the procurement problem firsthand. Billion-dollar decisions made on incomplete data, Excel sheets, and gut feel. We built 1Buy.AI to change that.
          </blockquote>
          <p className="text-slate-400">— 1Buy.AI Founders</p>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Electronic Components Watermark Background */}
        <ElectronicComponentsPattern />
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
            Join our mission
          </h2>
          
          {/* White box container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-slate-600 mb-8">
              We&apos;re building a world-class team to transform electronics procurement. If you&apos;re passionate about solving complex problems, we&apos;d love to hear from you.
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

export default TeamPage;
