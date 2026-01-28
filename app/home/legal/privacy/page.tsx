"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { companyInfo } from "@/lib/company-info";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO HOME</span>
        </Link>

        <div className="bg-white border border-green-200 shadow-sm p-6 sm:p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider">PRIVACY POLICY</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base font-light">
            <p className="text-slate-600">Last Updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">1. INTRODUCTION</h2>
              <p className="text-slate-700 leading-relaxed">
                {companyInfo.name} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our website and make purchases.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">2. INFORMATION WE COLLECT</h2>
              <h3 className="text-lg font-light mb-3 text-slate-800">2.1 Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Name, email address, phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Account credentials (email and password)</li>
              </ul>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-slate-700 leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations (GST, tax reporting)</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">4. INFORMATION SHARING AND DISCLOSURE</h2>
              <p className="text-slate-700 leading-relaxed mb-3">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Payment Processors:</strong> Razorpay for payment processing (they handle payment data securely)</li>
                <li><strong>Shipping Partners:</strong> Courier companies for order delivery</li>
                <li><strong>Service Providers:</strong> Companies that help us operate our business (hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">5. DATA SECURITY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure password storage (hashed passwords)</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">6. DATA RETENTION</h2>
              <p className="text-slate-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                unless a longer retention period is required or permitted by law (e.g., for tax and accounting purposes, we may 
                retain order information for 7 years as per Indian tax laws).
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">7. YOUR RIGHTS</h2>
              <p className="text-slate-700 leading-relaxed mb-3">Under Indian data protection laws, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">8. COOKIES</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use cookies and similar technologies to enhance your browsing experience. Cookies are small text files stored 
                on your device. We use cookies for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Remembering your preferences</li>
                <li>Maintaining your shopping cart</li>
                <li>Analyzing website traffic</li>
                <li>Improving website functionality</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                You can control cookies through your browser settings, but this may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">9. CHILDREN'S PRIVACY</h2>
              <p className="text-slate-700 leading-relaxed">
                Our website is not intended for children under 18 years of age. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">10. CHANGES TO THIS PRIVACY POLICY</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
                Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">11. CONTACT US</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-slate-700"><strong>Email:</strong> {companyInfo.contact.email}</p>
                <p className="text-slate-700"><strong>Phone:</strong> {companyInfo.contact.phone}</p>
                <p className="text-slate-700"><strong>Address:</strong> {companyInfo.address.line1}, {companyInfo.address.city}, {companyInfo.address.state} - {companyInfo.address.zipCode}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
