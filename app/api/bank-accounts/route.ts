import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
} from "@/lib/api-helpers";
import BankAccount from "@/models/BankAccount";
import { initiateAccountLinking } from "@/lib/mono";

/**
 * GET /api/bank-accounts
 * List all bank accounts for the authenticated user
 */
export async function GET() {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const bankAccounts = await BankAccount.find({
      userId: user.id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedAccounts = bankAccounts.map((account) => ({
      id: account._id.toString(),
      userId: account.userId.toString(),
      monoAccountId: account.monoAccountId,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance,
      isActive: account.isActive,
      syncStatus: account.syncStatus,
      lastSyncAt: account.lastSyncAt?.toISOString(),
      lastError: account.lastError,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedAccounts);
  } catch (error) {
    return handleApiError(error, "Failed to fetch bank accounts");
  }
}

/**
 * POST /api/bank-accounts
 * Initiate bank account linking - returns Mono Connect link
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validationError = validateRequest(body, ["redirectUrl"]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { redirectUrl } = body;

    // Generate Mono Connect link
    // Mono requires customer to be an object with name and email
    const connectResponse = await initiateAccountLinking(
      {
        name: user.name || "User",
        email: user.email,
      },
      redirectUrl
    );

    // Mono initiate endpoint returns the URL in data.mono_url
    // Append public key to URL if not already present (needed for Connect widget)
    const publicKey = process.env.MONO_PUBLIC_KEY;
    const response = connectResponse as any;

    // Check if response has a nested data object (some APIs wrap responses)
    const responseData = response.data || response;

    // Mono API returns the authorization URL in data.mono_url
    let connectLink =
      responseData.mono_url ||
      response.mono_url ||
      responseData.authorization_url ||
      responseData.authLink ||
      responseData.connect_url ||
      responseData.url ||
      responseData.link ||
      responseData.auth_url ||
      response.authorization_url ||
      response.authLink ||
      response.connect_url ||
      response.url ||
      response.link;

    // Fallback: construct URL if Mono returns code instead of full URL
    if (!connectLink && (responseData.code || response.code)) {
      const code = responseData.code || response.code;
      connectLink = `https://connect.withmono.com?code=${code}`;
    }

    // If still no link, check if there's a direct URL in the response
    if (!connectLink) {
      console.error("No connect link found in Mono response:", response);
      throw new Error(
        `No authorization URL received from Mono. Response: ${JSON.stringify(
          response
        )}`
      );
    }

    // Append public key to URL if needed (for Connect widget to work)
    if (
      connectLink &&
      publicKey &&
      !connectLink.includes("key=") &&
      !connectLink.includes("publicKey=")
    ) {
      const separator = connectLink.includes("?") ? "&" : "?";
      connectLink = `${connectLink}${separator}key=${encodeURIComponent(
        publicKey
      )}`;
    }

    return NextResponse.json({
      connectLink,
      code: response.code,
      id: response.id,
    });
  } catch (error) {
    return handleApiError(error, "Failed to initiate account linking");
  }
}
