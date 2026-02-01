/**
 * Mono API Client
 * Handles all interactions with Mono API for bank account linking and transaction syncing
 */

const MONO_BASE_URL = process.env.MONO_BASE_URL || "https://api.withmono.com";
const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;
const MONO_PUBLIC_KEY = process.env.MONO_PUBLIC_KEY;

if (!MONO_SECRET_KEY) {
  console.warn("MONO_SECRET_KEY is not set. Mono integration will not work.");
}

export interface MonoAccount {
  _id?: string;
  id?: string;
  account_number?: string;
  accountNumber?: string;
  name?: string;
  accountName?: string;
  institution?: {
    name: string;
    bank_code?: string;
    code?: string;
    type?: string;
  };
  bank?: {
    name: string;
    code?: string;
    bank_code?: string;
  };
  type?: string;
  currency?: string;
  balance?: number;
}

export interface MonoTransaction {
  _id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  category?: string;
  date: string;
  balance?: number;
  reference?: string;
}

export interface MonoConnectResponse {
  status?: string;
  message?: string;
  timestamp?: string;
  data?: {
    mono_url?: string;
    customer?: string;
    scope?: string;
    institution?: any;
    redirect_url?: string;
    is_multi?: boolean;
    created_at?: string;
  };
  // Legacy fields (for backwards compatibility)
  id?: string;
  code?: string;
  authLink?: string;
  authorization_url?: string;
  connect_url?: string;
}

export interface MonoAccountInfoResponse {
  account: MonoAccount;
}

export interface MonoTransactionsResponse {
  data: MonoTransaction[];
  meta?: {
    total: number;
    page: number;
    pages: number;
  };
}

/**
 * Get Mono API headers with authentication
 */
function getMonoHeaders(): HeadersInit {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  return {
    "mono-sec-key": MONO_SECRET_KEY,
    "Content-Type": "application/json",
  };
}

/**
 * Initiate account linking - generates a connect link for the user
 * @param customer - Customer object with name and email
 * @param redirectUrl - URL to redirect after successful linking
 * @returns Connect link and code
 */
export async function initiateAccountLinking(
  customer: { name: string; email: string },
  redirectUrl: string
): Promise<MonoConnectResponse> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  // Public key is not needed in the backend API request
  // It will be added to the authorization URL for the frontend widget

  const response = await fetch(`${MONO_BASE_URL}/v2/accounts/initiate`, {
    method: "POST",
    headers: getMonoHeaders(),
    body: JSON.stringify({
      customer: {
        name: customer.name || "User",
        email: customer.email,
      },
      redirect_url: redirectUrl,
      scope: "auth",
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    const errorMessage =
      errorData.message ||
      errorData.error ||
      `Mono API error: ${response.statusText}`;
    console.error("Mono API initiateAccountLinking error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      payload: { customer, redirect_url: redirectUrl },
    });
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  return responseData;
}

/**
 * Exchange authorization code for account ID
 * This is called after the Mono Connect Widget returns a code via onSuccess callback
 * @param code - Authorization code from Mono Connect callback
 * @returns Account ID
 */
export async function exchangeCodeForAccountId(code: string): Promise<string> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  console.log("Exchanging code for account ID:", code);

  const response = await fetch(`${MONO_BASE_URL}/v2/accounts/auth`, {
    method: "POST",
    headers: getMonoHeaders(),
    body: JSON.stringify({
      code,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    console.error("Exchange code error:", error);
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Exchange code response:", data);
  
  // Mono API returns the account ID in data.data.id (nested structure)
  const accountId = data.data?.id || data.id;
  
  if (!accountId) {
    console.error("No account ID in response:", data);
    throw new Error("No account ID received from Mono");
  }
  
  console.log("Successfully extracted account ID:", accountId);
  return accountId;
}

/**
 * Get account information
 * @param accountId - Mono account ID
 * @returns Account information
 */
export async function getAccountInfo(
  accountId: string
): Promise<MonoAccountInfoResponse> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  const response = await fetch(`${MONO_BASE_URL}/v2/accounts/${accountId}`, {
    method: "GET",
    headers: getMonoHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Account not found or access expired");
    }
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Get account info response:", JSON.stringify(data, null, 2));
  
  // Mono API may wrap the response in a data object
  // Handle both { account: {...} } and { data: { account: {...} } }
  const accountData = data.data || data;
  
  if (!accountData.account) {
    console.error("No account data in response:", data);
    throw new Error("Invalid account info response from Mono");
  }
  
  return accountData;
}

/**
 * Get account transactions
 * @param accountId - Mono account ID
 * @param startDate - Start date for transactions (ISO format)
 * @param endDate - End date for transactions (ISO format)
 * @param page - Page number (default: 1)
 * @param limit - Number of transactions per page (default: 50)
 * @returns Transactions array
 */
export async function getAccountTransactions(
  accountId: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 50
): Promise<MonoTransactionsResponse> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (startDate) {
    params.append("start", startDate);
  }
  if (endDate) {
    params.append("end", endDate);
  }

  const response = await fetch(
    `${MONO_BASE_URL}/v2/accounts/${accountId}/transactions?${params.toString()}`,
    {
      method: "GET",
      headers: getMonoHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Account not found or access expired");
    }
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get account balance
 * @param accountId - Mono account ID
 * @returns Account balance
 */
export async function getAccountBalance(accountId: string): Promise<number> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  const response = await fetch(
    `${MONO_BASE_URL}/v2/accounts/${accountId}/balance`,
    {
      method: "GET",
      headers: getMonoHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Account not found or access expired");
    }
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Get account balance response:", data);
  
  // Handle nested data structure: { data: { balance: 123 } } or { balance: 123 }
  const balance = data.data?.balance ?? data.balance ?? 0;
  return balance;
}

/**
 * Unlink/delete account from Mono
 * @param accountId - Mono account ID
 */
export async function unlinkAccount(accountId: string): Promise<void> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  const response = await fetch(`${MONO_BASE_URL}/v2/accounts/${accountId}`, {
    method: "DELETE",
    headers: getMonoHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }
}

/**
 * Re-authenticate account (for expired tokens)
 * @param accountId - Mono account ID
 * @param redirectUrl - URL to redirect after re-authentication
 * @returns New connect link
 */
export async function reauthenticateAccount(
  accountId: string,
  redirectUrl: string
): Promise<MonoConnectResponse> {
  if (!MONO_SECRET_KEY) {
    throw new Error("MONO_SECRET_KEY is not configured");
  }

  const response = await fetch(
    `${MONO_BASE_URL}/v2/accounts/${accountId}/reauthorise`,
    {
      method: "POST",
      headers: getMonoHeaders(),
      body: JSON.stringify({
        redirect_url: redirectUrl,
      }),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Mono API error: ${response.statusText}`);
  }

  return response.json();
}
