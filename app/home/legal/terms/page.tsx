"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { companyInfo } from "@/lib/company-info";

export default function TermsAndConditionsPage() {
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
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider">TERMS & CONDITIONS</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base font-light">
            <p className="text-slate-600">Last Updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">2. USE LICENSE</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Permission is granted to temporarily download one copy of the materials on {companyInfo.name}'s website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">3. PRODUCT INFORMATION</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product 
                descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
              </p>
              <p className="text-slate-700 leading-relaxed">
                All prices are in Indian Rupees (INR) and include applicable taxes (GST) as per Indian tax regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">4. ORDERS AND PAYMENT</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                By placing an order, you are offering to purchase a product subject to the following terms and conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>All orders are subject to product availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Payment must be received before order processing</li>
                <li>We accept payments through Razorpay (credit/debit cards, UPI, net banking, wallets)</li>
                <li>All transactions are secure and encrypted</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">5. SHIPPING AND DELIVERY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We ship products across India. Delivery times are estimates and not guaranteed. Factors such as weather, 
                natural disasters, or other circumstances beyond our control may affect delivery times.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Standard delivery: {companyInfo.shippingPolicy.estimatedDays.standard} business days</li>
                <li>Shipping charges: {companyInfo.shippingPolicy.freeShippingThreshold === 0 ? "Free" : `Free for orders above ₹${companyInfo.shippingPolicy.freeShippingThreshold}`}</li>
                <li>We are not responsible for delays caused by shipping carriers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">6. RETURNS AND REFUNDS</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Please refer to our <Link href="/home/legal/returns" className="text-green-600 hover:text-green-700 underline">Return & Refund Policy</Link> for detailed information.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Return requests must be initiated within {companyInfo.returnPolicy.days} days of delivery</li>
                <li>Products must be in original condition with all tags and packaging</li>
                <li>Refunds will be processed within 7-10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">7. GST AND TAXES</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                All prices displayed on our website are inclusive of applicable GST (Goods and Services Tax) as per Indian tax laws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>GST is calculated based on the product category and applicable rates</li>
                <li>For intra-state orders: CGST + SGST applies</li>
                <li>For inter-state orders: IGST applies</li>
                <li>GST invoice will be provided with every order</li>
                <li>Our GST Number: {companyInfo.gstNumber}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">8. PRIVACY POLICY</h2>
              <p className="text-slate-700 leading-relaxed">
                Your privacy is important to us. Please review our <Link href="/home/legal/privacy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</Link>, 
                which also governs your use of the website, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">9. LIMITATION OF LIABILITY</h2>
              <p className="text-slate-700 leading-relaxed">
                In no event shall {companyInfo.name} or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
                the materials on our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">10. GOVERNING LAW</h2>
              <p className="text-slate-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes relating 
                to these terms and conditions will be subject to the exclusive jurisdiction of the courts of India.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">11. CONTACT INFORMATION</h2>
              <p className="text-slate-700 leading-relaxed">
                For any questions regarding these Terms & Conditions, please contact us at:
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
