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
import { CustomCursor } from "@/components/ui/CustomCursor";
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
    <div className="relative min-h-screen bg-[#030014] font-sans text-foreground selection:bg-purple-500/30 scroll-smooth">
      {/* Dynamic Scroll Background */}
      <DynamicBackground />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Animated Background Grid */}
      <AnimatedGrid />

      {/* Scroll Progress Components */}
      <ScrollProgress />
      <FloatingActionButton />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
          ? "border-white/10 bg-[#030014]/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-white/5 bg-[#030014]/70 backdrop-blur-xl"
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden transition-transform group-hover:scale-105"
              whileHover={{ rotate: 5 }}
            >
              <img
                src="/logo-icon.png"
                alt="Kirata Logo"
                className="h-full w-full object-contain"
              />
            </motion.div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Kirata
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${activeSection === link.href.slice(1)
                  ? "text-white"
                  : "text-gray-300"
                  }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-300 transition hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            >
              Login
            </Link>

            <Link href="/register" className="hidden sm:block">
              <Button
                size="sm"
                className="rounded-full bg-white px-6 text-black shadow-lg transition-all hover:bg-gray-200 hover:shadow-white/20 hover:scale-105"
              >
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 flex-1 pt-16">
        <div id="hero">
          <Hero />
        </div>
        <div id="social-proof">
          <SocialProof />
        </div>
        <SectionDivider variant="gradient" />
        <Stats />
        <SectionDivider variant="dots" />
        <AppShowcase />
        <SectionDivider variant="line" />
        <LiveTicker />
        <SectionDivider variant="line" />
        <ProductTour />
        <SectionDivider variant="gradient" />
        <HowItWorks />
        <SectionDivider variant="dots" />
        <div id="features">
          <Features />
        </div>
        <SectionDivider variant="line" />
        <ComparisonSlider />
        <SectionDivider variant="gradient" />
        <Integrations />
        <SectionDivider variant="dots" />
        <TechStack />
        <SectionDivider variant="line" />
        <SuccessStories />
        <SectionDivider variant="gradient" />
        <div id="testimonials">
          <Testimonials />
        </div>
        <SectionDivider variant="dots" />
        <ROICalculator />
        <SectionDivider variant="line" />
        <div id="pricing">
          <Pricing />
        </div>
        <SectionDivider variant="gradient" />
        <div id="faq">
          <FAQ />
        </div>
        <SectionDivider variant="dots" />
        <div id="newsletter">
          <Newsletter />
        </div>
        <SectionDivider variant="line" />
        <TrustBadges />
        <CallToAction />
      </main>

      {/* Back to Top Button */}
      <BackToTop />

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}
