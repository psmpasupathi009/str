"use client";

import Link from "next/link";
import { Youtube, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="text-white text-2xl sm:text-3xl font-light tracking-[0.2em] sm:tracking-[0.3em] mb-2">
            STR
          </div>
          <div className="text-gray-400 text-xs sm:text-sm font-light tracking-widest">
            E-COMMERCE
          </div>
          <div className="w-full max-w-4xl h-px bg-white/10 mt-6 sm:mt-8"></div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Column 1 */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/pre-owned"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              PRE-OWNED
            </Link>
            <Link
              href="/dealers"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              FIND A DEALER
            </Link>
            <Link
              href="/privacy"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              PRIVACY
            </Link>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-light tracking-wider">
              LANGUAGE
              <span className="text-xs">🇬🇧</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/cookies"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              COOKIES
            </Link>
            <Link
              href="/tyre-labels"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              EU TYRE LABELS
            </Link>
            <Link
              href="/careers"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              CAREERS
            </Link>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/press"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              PRESSCLUB
            </Link>
            <Link
              href="/battery"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              BATTERY REGULATION
            </Link>
            <Link
              href="/sitemap"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              SITE MAP
            </Link>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/legal"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              LEGAL
            </Link>
            <Link
              href="/faqs"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              FAQS
            </Link>
            <Link
              href="/whispers"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              WHISPERS
            </Link>
          </div>

          {/* Column 5 */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/complaints"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              COMPLAINTS
            </Link>
            <Link
              href="/contact"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              CONTACT
            </Link>
            <Link
              href="/sustainability"
              className="text-xs sm:text-sm font-light tracking-wider hover:text-white transition-colors"
            >
              SUSTAINABILITY
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-8"></div>

        {/* Social Media Icons */}
        <div className="flex justify-center sm:justify-end items-center gap-4 sm:gap-6">
          <Link
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
