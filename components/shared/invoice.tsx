"use client";

import { companyInfo } from "@/lib/company-info";

interface OrderItem {
  id: string;
  productName: string;
  hsnCode?: string | null;
  quantity: number;
  price: number;
  gstRate?: number | null;
  gstAmount?: number | null;
  totalPrice: number;
}

interface Order {
  id: string;
  invoiceNumber?: string | null;
  amount: number;
  subtotal?: number | null;
  gstAmount?: number | null;
  cgstAmount?: number | null;
  sgstAmount?: number | null;
  igstAmount?: number | null;
  items: OrderItem[];
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: any;
  createdAt: string;
  razorpayPaymentId?: string | null;
}

interface InvoiceProps {
  order: Order;
}

export default function Invoice({ order }: InvoiceProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const subtotal = order.subtotal || order.amount;
  const gstAmount = order.gstAmount || 0;
  const cgst = order.cgstAmount || 0;
  const sgst = order.sgstAmount || 0;
  const igst = order.igstAmount || 0;
  const isIntraState = cgst > 0 && sgst > 0;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="invoice">
      {/* Header */}
      <div className="border-b-2 border-green-600 pb-4 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-light tracking-wider text-slate-900 mb-2">
              {companyInfo.name}
            </h1>
            <p className="text-sm text-slate-600 font-light">
              {companyInfo.legalName}
            </p>
            <div className="mt-4 text-sm text-slate-700 font-light space-y-1">
              <p>{companyInfo.address.line1}</p>
              {companyInfo.address.line2 && <p>{companyInfo.address.line2}</p>}
              <p>
                {companyInfo.address.city}, {companyInfo.address.state} - {companyInfo.address.zipCode}
              </p>
              <p>{companyInfo.address.country}</p>
              <p className="mt-2">GSTIN: {companyInfo.gstNumber}</p>
              {companyInfo.panNumber && <p>PAN: {companyInfo.panNumber}</p>}
              <p>Phone: {companyInfo.contact.phone}</p>
              <p>Email: {companyInfo.contact.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-light tracking-wide text-slate-900 mb-4">TAX INVOICE</h2>
            <div className="text-sm text-slate-700 font-light space-y-1">
              <p><strong>Invoice No:</strong> {order.invoiceNumber || `INV-${order.id.slice(-8).toUpperCase()}`}</p>
              <p><strong>Invoice Date:</strong> {formatDate(order.createdAt)}</p>
              <p><strong>Order ID:</strong> {order.id.slice(-8).toUpperCase()}</p>
              {order.razorpayPaymentId && (
                <p><strong>Payment ID:</strong> {order.razorpayPaymentId.slice(-8)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Shipping Address */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-light tracking-wide text-slate-900 mb-2 border-b border-green-200 pb-1">
            BILL TO
          </h3>
          <div className="text-sm text-slate-700 font-light space-y-1">
            <p className="font-medium">{order.customerName || "N/A"}</p>
            {order.shippingAddress && (
              <>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                {order.customerEmail && <p>Email: {order.customerEmail}</p>}
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-light tracking-wide text-slate-900 mb-2 border-b border-green-200 pb-1">
            SHIP TO
          </h3>
          <div className="text-sm text-slate-700 font-light space-y-1">
            {order.shippingAddress ? (
              <>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </>
            ) : (
              <p>Same as billing address</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-50 border-b-2 border-green-200">
              <th className="text-left p-3 text-sm font-light text-slate-900">S.No</th>
              <th className="text-left p-3 text-sm font-light text-slate-900">Item Description</th>
              <th className="text-center p-3 text-sm font-light text-slate-900">HSN Code</th>
              <th className="text-center p-3 text-sm font-light text-slate-900">Qty</th>
              <th className="text-right p-3 text-sm font-light text-slate-900">Rate</th>
              <th className="text-right p-3 text-sm font-light text-slate-900">GST %</th>
              <th className="text-right p-3 text-sm font-light text-slate-900">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id} className="border-b border-green-100">
                <td className="p-3 text-sm text-slate-700 font-light">{index + 1}</td>
                <td className="p-3 text-sm text-slate-700 font-light">{item.productName}</td>
                <td className="p-3 text-sm text-slate-700 font-light text-center">{item.hsnCode || "N/A"}</td>
                <td className="p-3 text-sm text-slate-700 font-light text-center">{item.quantity}</td>
                <td className="p-3 text-sm text-slate-700 font-light text-right">
                  ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-sm text-slate-700 font-light text-right">
                  {item.gstRate ? `${(item.gstRate * 100).toFixed(0)}%` : "N/A"}
                </td>
                <td className="p-3 text-sm text-slate-700 font-light text-right">
                  ₹{item.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-96 space-y-2">
          <div className="flex justify-between text-sm text-slate-700 font-light">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {isIntraState ? (
            <>
              <div className="flex justify-between text-sm text-slate-700 font-light">
                <span>CGST:</span>
                <span>₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700 font-light">
                <span>SGST:</span>
                <span>₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm text-slate-700 font-light">
              <span>IGST:</span>
              <span>₹{igst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="border-t-2 border-green-600 pt-2 flex justify-between text-lg font-light text-slate-900">
            <span>Total:</span>
            <span>₹{order.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-green-600 pt-4 mt-8 text-xs text-slate-600 font-light space-y-2">
        <p><strong>Terms & Conditions:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Goods once sold will not be taken back or exchanged except for manufacturing defects.</li>
          <li>Subject to {order.shippingAddress?.state || "local"} jurisdiction.</li>
          <li>This is a computer-generated invoice and does not require a signature.</li>
        </ul>
        <p className="mt-4 text-center">Thank you for your business!</p>
      </div>
    </div>
  );
}
