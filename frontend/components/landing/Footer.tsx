"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import React from "react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-40 ">
      {/* Top light divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-purple-900/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-2 gap-14 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-3 text-xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              Kirata
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              The operating system for local commerce.
              Built to help businesses grow with confidence.
            </p>
          </div>

          <FooterColumn title="Product">
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#">Pricing</FooterLink>
            <FooterLink href="#">Integrations</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
          </FooterColumn>

          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms of Service</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom */}
        <div className="mt-20 flex flex-col items-center gap-4 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kirata Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================= FOOTER HELPERS ================= */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/80">
        {title}
      </h4>
      <ul className="space-y-3 text-sm text-gray-400">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="relative inline-block transition-colors duration-300 hover:text-white"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
      </Link>
    </li>
  );
}
