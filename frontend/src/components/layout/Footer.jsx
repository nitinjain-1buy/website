import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { footerData } from '../../data/mock';
import { Linkedin } from 'lucide-react';

// X (formerly Twitter) icon component
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState({
    twitterUrl: '',
    linkedinUrl: ''
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/site-settings`);
        if (response.ok) {
          const data = await response.json();
          setSocialLinks({
            twitterUrl: data.twitterUrl || '',
            linkedinUrl: data.linkedinUrl || ''
          });
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };
    fetchSocialLinks();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">1BUY.AI</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {footerData.tagline}
            </p>
            {/* Social Links - Only show if URLs are configured */}
            {(socialLinks.linkedinUrl || socialLinks.twitterUrl) && (
              <div className="flex space-x-4">
                {socialLinks.linkedinUrl && (
                  <a 
                    href={socialLinks.linkedinUrl.startsWith('http') ? socialLinks.linkedinUrl : `https://${socialLinks.linkedinUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.twitterUrl && (
                  <a 
                    href={socialLinks.twitterUrl.startsWith('http') ? socialLinks.twitterUrl : `https://${socialLinks.twitterUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <XIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {footerData.links.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerData.links.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerData.links.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} 1Buy.AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
