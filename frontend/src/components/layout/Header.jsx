import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { navigationData, logoUrl } from '../../data/mock';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const productSubNav = [
    { name: '1Data', href: '/products#1data', description: 'Pricing & Risk Intelligence' },
    { name: '1Source', href: '/products#1source', description: 'High-Impact Sourcing Execution' },
    { name: '1Xcess', href: '/products#1xcess', description: 'Excess Inventory Monetization' },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl} 
              alt="1Buy.AI" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-700 hover:text-slate-900 bg-transparent">
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {productSubNav.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100"
                            >
                              <div className="text-sm font-medium text-slate-900">{item.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navigationData.filter(item => item.name !== 'Products').map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(item.href)
                    ? 'text-emerald-600'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/contact">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                Request Demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Products</p>
                  {productSubNav.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-slate-500">{item.description}</div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  {navigationData.filter(item => item.name !== 'Products').map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <Link to="/contact" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Talk to Us
                    </Button>
                  </Link>
                  <Link to="/contact" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800">
                      Request Demo
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
