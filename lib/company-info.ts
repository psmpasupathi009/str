/**
 * Company Information Configuration
 * Required for Indian e-commerce legal compliance
 * Update these details with your actual company information
 */

export interface CompanyInfo {
  name: string;
  legalName: string;
  gstNumber: string;
  panNumber?: string;
  cinNumber?: string; // Company Identification Number (if applicable)
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  returnPolicy: {
    days: number; // Return period in days
    conditions: string[];
  };
  cancellationPolicy: {
    allowedBeforeShipping: boolean;
    allowedAfterShipping: boolean;
    conditions: string[];
  };
  shippingPolicy: {
    freeShippingThreshold?: number;
    estimatedDays: {
      standard: number;
      express?: number;
    };
  };
}

export const companyInfo: CompanyInfo = {
  name: "STN Golden Healthy Foods",
  legalName: "STN Golden Healthy Foods Private Limited",
  gstNumber: "29XXXXXXXXXXXXXX", // TODO: Update with actual GST number
  panNumber: "XXXXXXXXXX", // TODO: Update with actual PAN number
  address: {
    line1: "Your Company Address Line 1",
    line2: "Your Company Address Line 2",
    city: "City",
    state: "State",
    zipCode: "PIN Code",
    country: "India",
  },
  contact: {
    phone: "+91-XXXXXXXXXX",
    email: "info@stngolden.com",
    website: "https://www.stngolden.com",
  },
  returnPolicy: {
    days: 7, // 7 days return policy as per Indian consumer law
    conditions: [
      "Products must be in original condition with all tags and packaging",
      "Return request must be initiated within 7 days of delivery",
      "Refund will be processed within 7-10 business days",
      "Shipping charges are non-refundable unless product is defective",
    ],
  },
  cancellationPolicy: {
    allowedBeforeShipping: true,
    allowedAfterShipping: false,
    conditions: [
      "Orders can be cancelled before shipping",
      "Cancellation after shipping is not allowed",
      "Refund will be processed within 7-10 business days",
    ],
  },
  shippingPolicy: {
    freeShippingThreshold: 0, // Free shipping for all orders
    estimatedDays: {
      standard: 5,
      express: 2,
    },
  },
};

/**
 * Calculate GST breakdown based on shipping state
 * Returns CGST/SGST for intra-state or IGST for inter-state
 */
export function calculateGSTBreakdown(
  subtotal: number,
  gstRate: number,
  shippingState: string,
  companyState: string = companyInfo.address.state
): {
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
} {
  const totalGST = subtotal * gstRate;
  
  // If shipping state is same as company state, apply CGST + SGST
  // Otherwise, apply IGST
  const isIntraState = shippingState.toLowerCase() === companyState.toLowerCase();
  
  if (isIntraState) {
    // CGST and SGST are each half of total GST
    const cgst = totalGST / 2;
    const sgst = totalGST / 2;
    return {
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: 0,
      totalGST: Math.round(totalGST * 100) / 100,
    };
  } else {
    // IGST is the full GST amount
    return {
      cgst: 0,
      sgst: 0,
      igst: Math.round(totalGST * 100) / 100,
      totalGST: Math.round(totalGST * 100) / 100,
    };
  }
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `INV-${year}${month}${day}-${random}`;
}
