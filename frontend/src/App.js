import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import WhyPage from "./pages/WhyPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import UseCasesPage from "./pages/UseCasesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TeamPage from "./pages/TeamPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import PlatformPage from "./pages/PlatformPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Auth & Admin routes - no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/platform" element={<PlatformPage />} />
          
          {/* Public routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/why-1buy" element={<WhyPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/use-cases" element={<UseCasesPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
