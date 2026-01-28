import { NextRequest, NextResponse } from "next/server";

/**
 * Check if user is authenticated (verified by middleware)
 */
export function getAuthenticatedUser(request: NextRequest): string | null {
  return request.headers.get("x-auth-email");
}

/**
 * Check if user is admin
 */
export function isAdmin(userEmail: string | null): boolean {
  if (!userEmail) return false;
  
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  
  return userEmail.toLowerCase() === adminEmail.toLowerCase();
}

/**
 * Require authentication - returns user email or throws 401
 */
export function requireAuth(request: NextRequest): string {
  const userEmail = getAuthenticatedUser(request);
  
  if (!userEmail) {
    throw new Error("Unauthorized");
  }
  
  return userEmail;
}

/**
 * Require admin access - returns user email or throws 401/403
 */
export function requireAdmin(request: NextRequest): string {
  const userEmail = requireAuth(request);
  
  const role = request.headers.get("x-auth-role");
  if (role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  
  return userEmail;
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    message ? { ...data, message } : data,
    { status }
  );
}

/**
 * Handle API route errors
 */
export function handleApiError(error: unknown, defaultMessage: string = "Internal server error"): NextResponse {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return createErrorResponse("Unauthorized", 401);
    }
    if (error.message === "Forbidden: Admin access required") {
      return createErrorResponse("Forbidden: Admin access required", 403);
    }
    return createErrorResponse(error.message || defaultMessage, 500);
  }
  
  return createErrorResponse(defaultMessage, 500);
}
