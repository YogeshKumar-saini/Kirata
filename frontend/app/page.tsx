"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Stats } from "@/components/landing/Stats";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { AnimatedGrid } from "@/components/ui/AnimatedGrid";

import { DynamicBackground } from "@/components/ui/DynamicBackground";

// Dynamic imports for below-the-fold components
const AppShowcase = dynamic(() => import("@/components/landing/AppShowcase").then(mod => ({ default: mod.AppShowcase })), { ssr: true });
const LiveTicker = dynamic(() => import("@/components/landing/LiveTicker").then(mod => ({ default: mod.LiveTicker })), { ssr: true });
const ProductTour = dynamic(() => import("@/components/landing/ProductTour").then(mod => ({ default: mod.ProductTour })), { ssr: true });
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then(mod => ({ default: mod.HowItWorks })), { ssr: true });
const Features = dynamic(() => import("@/components/landing/Features").then(mod => ({ default: mod.Features })), { ssr: true });
const ComparisonSlider = dynamic(() => import("@/components/landing/ComparisonSlider").then(mod => ({ default: mod.ComparisonSlider })), { ssr: true });
const Integrations = dynamic(() => import("@/components/landing/Integrations").then(mod => ({ default: mod.Integrations })), { ssr: true });
const TechStack = dynamic(() => import("@/components/landing/TechStack").then(mod => ({ default: mod.TechStack })), { ssr: true });
const SuccessStories = dynamic(() => import("@/components/landing/SuccessStories").then(mod => ({ default: mod.SuccessStories })), { ssr: true });
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then(mod => ({ default: mod.Testimonials })), { ssr: true });
const ROICalculator = dynamic(() => import("@/components/landing/ROICalculator").then(mod => ({ default: mod.ROICalculator })), { ssr: true });
const Pricing = dynamic(() => import("@/components/landing/Pricing").then(mod => ({ default: mod.Pricing })), { ssr: true });
const FAQ = dynamic(() => import("@/components/landing/FAQ").then(mod => ({ default: mod.FAQ })), { ssr: true });
const Newsletter = dynamic(() => import("@/components/landing/Newsletter").then(mod => ({ default: mod.Newsletter })), { ssr: true });
const TrustBadges = dynamic(() => import("@/components/landing/TrustBadges").then(mod => ({ default: mod.TrustBadges })), { ssr: true });
const CallToAction = dynamic(() => import("@/components/landing/CallToAction").then(mod => ({ default: mod.CallToAction })), { ssr: true });
const Footer = dynamic(() => import("@/components/landing/Footer").then(mod => ({ default: mod.Footer })), { ssr: true });


const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ["hero", "features", "pricing", "testimonials", "faq"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] font-sans text-foreground selection:bg-purple-500/30 scroll-smooth overflow-x-hidden">
      {/* Enhanced Background Layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#030014] via-[#0a0520] to-[#030014]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />
      </div>
      {/* Dynamic Scroll Background */}
      <DynamicBackground />



      {/* Animated Background Grid */}
      <AnimatedGrid />

      {/* Scroll Progress Components */}
      <ScrollProgress />
      <FloatingActionButton />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled
          ? "border-b border-white/10 bg-[#030014]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-b border-white/5 bg-[#030014]/60 backdrop-blur-xl"
          }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-3 relative z-10">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              whileHover={{ rotate: 5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/logo-icon.png"
                alt="Kirata Logo"
                className="h-full w-full object-contain"
              />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-white">
              Kirata
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${activeSection === link.href.slice(1)
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                <span className="relative z-10">{link.label}</span>
                {activeSection === link.href.slice(1) && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-100 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-300 transition-all duration-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Login
            </Link>

            <Link href="/register" className="hidden sm:block group">
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 h-10 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105 font-semibold border-0"
              >
                <span className="relative z-10">Get Started</span>
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 flex-1">
        <div id="hero">
          <Hero />
        </div>
        <div id="social-proof" className="relative">
          <SocialProof />
        </div>
        <SectionDivider variant="gradient" />
        <div className="relative">
          <Stats />
        </div>
        <SectionDivider variant="dots" />
        <div className="relative">
          <AppShowcase />
        </div>
        <SectionDivider variant="line" />
        <div className="relative">
          <LiveTicker />
        </div>
        <SectionDivider variant="line" />
        <div className="relative">
          <ProductTour />
        </div>
        <SectionDivider variant="gradient" />
        <div className="relative">
          <HowItWorks />
        </div>
        <SectionDivider variant="dots" />
        <div id="features" className="relative">
          <Features />
        </div>
        <SectionDivider variant="line" />
        <div className="relative">
          <ComparisonSlider />
        </div>
        <SectionDivider variant="gradient" />
        <div className="relative">
          <Integrations />
        </div>
        <SectionDivider variant="dots" />
        <div className="relative">
          <TechStack />
        </div>
        <SectionDivider variant="line" />
        <div className="relative">
          <SuccessStories />
        </div>
        <SectionDivider variant="gradient" />
        <div id="testimonials" className="relative">
          <Testimonials />
        </div>
        <SectionDivider variant="dots" />
        <div className="relative">
          <ROICalculator />
        </div>
        <SectionDivider variant="line" />
        <div id="pricing" className="relative">
          <Pricing />
        </div>
        <SectionDivider variant="gradient" />
        <div id="faq" className="relative">
          <FAQ />
        </div>
        <SectionDivider variant="dots" />
        <div id="newsletter" className="relative">
          <Newsletter />
        </div>
        <SectionDivider variant="line" />
        <div className="relative">
          <TrustBadges />
        </div>
        <div className="relative">
          <CallToAction />
        </div>
      </main>

      {/* Back to Top Button */}
      <BackToTop />

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}
