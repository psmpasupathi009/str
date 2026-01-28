"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { companyInfo } from "@/lib/company-info";

export default function ReturnRefundPolicyPage() {
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
            <RotateCcw className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider">RETURN & REFUND POLICY</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base font-light">
            <p className="text-slate-600">Last Updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">1. RETURN POLICY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We want you to be completely satisfied with your purchase. If you are not satisfied, you may return eligible 
                products within {companyInfo.returnPolicy.days} days of delivery, subject to the conditions below.
              </p>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">1.1 Return Eligibility</h3>
              <p className="text-slate-700 leading-relaxed mb-3">Products are eligible for return if:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                {companyInfo.returnPolicy.conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
                <li>Product is unused, unopened, and in original packaging</li>
                <li>All tags, labels, and accessories are intact</li>
                <li>Return request is initiated within {companyInfo.returnPolicy.days} days of delivery</li>
              </ul>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">1.2 Non-Returnable Items</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Perishable goods (food items that have been opened)</li>
                <li>Products damaged due to misuse or negligence</li>
                <li>Products without original packaging or tags</li>
                <li>Customized or personalized products</li>
                <li>Products returned after {companyInfo.returnPolicy.days} days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">2. HOW TO INITIATE A RETURN</h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                <li>Log in to your account and go to "My Orders"</li>
                <li>Select the order containing the item you want to return</li>
                <li>Click on "Return Item" and select the reason for return</li>
                <li>Submit the return request</li>
                <li>You will receive a return authorization and return shipping label (if applicable)</li>
                <li>Pack the item securely in original packaging</li>
                <li>Ship the item back to us using the provided label or our return address</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">3. RETURN SHIPPING</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Return shipping charges depend on the reason for return:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Defective/Wrong Product:</strong> We will bear the return shipping cost</li>
                <li><strong>Change of Mind:</strong> Customer bears the return shipping cost</li>
                <li><strong>Damaged in Transit:</strong> We will bear the return shipping cost</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">4. REFUND POLICY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Once we receive and inspect the returned product, we will process your refund:
              </p>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">4.1 Refund Processing</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Refunds will be processed within 7-10 business days after we receive the returned product</li>
                <li>Refund will be issued to the original payment method used for the purchase</li>
                <li>For cash on delivery orders, refund will be processed via bank transfer (account details required)</li>
                <li>Shipping charges are non-refundable unless the product is defective or wrong item was sent</li>
              </ul>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">4.2 Refund Amount</h3>
              <p className="text-slate-700 leading-relaxed mb-3">The refund amount will include:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Full product price (as paid)</li>
                <li>Original shipping charges (only if product is defective or wrong item)</li>
                <li>GST amount will be refunded as per tax regulations</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                <strong>Note:</strong> Return shipping charges (if applicable) will be deducted from the refund amount.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">5. CANCELLATION POLICY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You can cancel your order under the following conditions:
              </p>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">5.1 Before Shipping</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                {companyInfo.cancellationPolicy.conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
                <li>Full refund will be processed within 7-10 business days</li>
              </ul>

              <h3 className="text-lg font-light mb-3 mt-6 text-slate-800">5.2 After Shipping</h3>
              <p className="text-slate-700 leading-relaxed">
                Once the order has been shipped, cancellation is not possible. However, you can return the product 
                after delivery following our return policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">6. EXCHANGE POLICY</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We currently do not offer direct exchanges. If you wish to exchange a product:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4">
                <li>Return the original product following our return policy</li>
                <li>Once the return is processed and refunded, place a new order for the desired product</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">7. DEFECTIVE OR DAMAGED PRODUCTS</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                If you receive a defective or damaged product:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Contact us immediately within 48 hours of delivery</li>
                <li>Provide photos of the defect or damage</li>
                <li>We will arrange for a replacement or full refund</li>
                <li>Return shipping will be free of charge</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">8. CONSUMER PROTECTION</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                This policy is in compliance with the Consumer Protection Act, 2019 and E-commerce Rules, 2020:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Clear return and refund policy displayed</li>
                <li>No cancellation charges for orders cancelled before shipping</li>
                <li>Refund processing within specified timeframes</li>
                <li>Grievance redressal mechanism available</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 text-slate-900">9. CONTACT FOR RETURNS</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                For return-related queries or assistance, please contact us:
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-slate-700"><strong>Email:</strong> {companyInfo.contact.email}</p>
                <p className="text-slate-700"><strong>Phone:</strong> {companyInfo.contact.phone}</p>
                <p className="text-slate-700"><strong>Return Address:</strong> {companyInfo.address.line1}, {companyInfo.address.city}, {companyInfo.address.state} - {companyInfo.address.zipCode}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
