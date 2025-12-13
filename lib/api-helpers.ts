import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Get the authenticated user from the session
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  return {
    id: (session.user as any).id,
    email: session.user.email,
    name: session.user.name || undefined,
  };
}

/**
 * Standardized error response helper
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || defaultMessage },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Unauthorized response helper
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

/**
 * Forbidden response helper
 */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

/**
 * Not found response helper
 */
export function notFoundResponse(resource: string = "Resource"): NextResponse {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

/**
 * Validate request body
 */
export function validateRequest(body: any, requiredFields: string[]): string | null {
  if (!body || typeof body !== "object") {
    return "Invalid request body";
  }

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      return `${field} is required`;
    }
  }

  return null;
}

