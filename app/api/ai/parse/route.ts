import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-helpers";
import {
  EXPENSE_CATEGORIES,
  isExpenseCategory,
  DEFAULT_CATEGORY,
} from "@/app/utils/categories";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST /api/ai/parse - Parse a free-text expense line into structured fields.
// Fallback for entries the client-side regex parser can't handle.
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI parsing not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 300) {
      return NextResponse.json(
        { error: "Provide a short expense description" },
        { status: 400 }
      );
    }

    const prompt = `Parse this Nigerian expense entry into structured data. Amounts are in Naira (₦). Shorthand like "2.5k" means 2500.

Entry: "${text}"

Categories: ${EXPENSE_CATEGORIES.join(", ")}

Return ONLY JSON, no other text:
{"amount": <number>, "description": "<short description without the amount>", "category": "<one of the categories>"}

If no amount can be determined, return {"amount": 0}.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse entry" },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const amount = Number(parsed.amount);
    if (!isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Could not find an amount in that entry" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      amount,
      description:
        typeof parsed.description === "string" && parsed.description.trim()
          ? parsed.description.trim()
          : text,
      category: isExpenseCategory(parsed.category)
        ? parsed.category
        : DEFAULT_CATEGORY,
    });
  } catch (error) {
    return handleApiError(error, "Failed to parse expense");
  }
}
