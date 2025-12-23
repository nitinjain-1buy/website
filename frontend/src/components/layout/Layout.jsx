import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ElectronicComponentsPattern from '../ElectronicComponentsPattern';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Electronic Components Pattern Background */}
      {/* This creates a seamless repeating pattern that covers the entire page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base background color */}
        <div className="absolute inset-0 bg-slate-50" />
        {/* Pattern layer */}
        <ElectronicComponentsPattern className="opacity-100" />
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50/50" />
      </div>
      
      {/* Header - above background */}
      <Header />
      
      {/* Main content - above background */}
      <main className="flex-1 pt-16 relative z-10">
        {children}
      </main>
      
      {/* Footer - above background */}
      <Footer />
    </div>
  );
};

export default Layout;
