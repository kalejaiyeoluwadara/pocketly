import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-helpers";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// List of models to try in order of preference
const MODELS_TO_TRY = ["gemini-2.5-flash"];

// Helper function to try generating content with multiple models
async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: any;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`✓ Successfully used model: ${modelName}`);
      return text;
    } catch (error: any) {
      console.log(`✗ Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
      continue;
    }
  }

  // If all models failed, throw the last error
  throw lastError;
}

interface SpendingAnalysis {
  totalSpent: number;
  averagePerDay: number;
  averagePerExpense: number;
  totalExpenses: number;
  topCategories: Array<{ category: string; amount: number; count: number }>;
  spendingTrend: "increasing" | "decreasing" | "stable";
  monthlyBreakdown: Array<{ month: string; amount: number; count: number }>;
  anomalies: Array<{
    description: string;
    severity: "high" | "medium" | "low";
  }>;
  insights: string[];
  recommendations: string[];
}

// Standard expense categories
const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health & Medical",
  "Education",
  "Subscriptions",
  "Travel",
  "Personal Care",
  "Home & Garden",
  "Gifts & Donations",
  "Fitness & Sports",
  "Insurance",
  "Investments",
  "Other",
];

// AI-powered batch expense categorization
async function categorizeExpensesWithAI(
  expenses: Array<{ description: string; amount: number }>
): Promise<Map<string, string>> {
  if (expenses.length === 0) return new Map();

  try {
    // Prepare expenses for categorization (limit to avoid token limits)
    const expensesToCategorize = expenses.slice(0, 100);
    const expensesList = expensesToCategorize
      .map((exp, idx) => `${idx}: "${exp.description}" (₦${exp.amount})`)
      .join("\n");

    const prompt = `Categorize these expenses into one of the following categories:
${EXPENSE_CATEGORIES.join(", ")}

Expenses to categorize:
${expensesList}

Return ONLY a JSON object mapping the expense index to its category. Example format:
{
  "0": "Food & Dining",
  "1": "Transportation",
  "2": "Shopping"
}

Be precise and consistent. Consider the context of each expense description.`;

    const text = await generateWithFallback(prompt);

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const categorizations = JSON.parse(jsonMatch[0]);
      const resultMap = new Map<string, string>();

      // Map categorizations back to descriptions
      expensesToCategorize.forEach((exp, idx) => {
        const category = categorizations[idx.toString()];
        if (category && EXPENSE_CATEGORIES.includes(category)) {
          resultMap.set(exp.description, category);
        } else {
          resultMap.set(exp.description, "Other");
        }
      });

      return resultMap;
    }
  } catch (error) {
    console.error("AI categorization failed:", error);
  }

  // Return empty map on failure - will use fallback categorization
  return new Map();
}

// Fallback categorization for when AI fails or isn't available
function fallbackCategorizeExpense(description: string): string {
  const desc = description.toLowerCase();

  if (
    desc.includes("food") ||
    desc.includes("restaurant") ||
    desc.includes("grocery") ||
    desc.includes("meal") ||
    desc.includes("eat") ||
    desc.includes("lunch") ||
    desc.includes("dinner") ||
    desc.includes("breakfast") ||
    desc.includes("cafe") ||
    desc.includes("coffee")
  ) {
    return "Food & Dining";
  }
  if (
    desc.includes("transport") ||
    desc.includes("uber") ||
    desc.includes("taxi") ||
    desc.includes("fuel") ||
    desc.includes("gas") ||
    desc.includes("bus") ||
    desc.includes("train") ||
    desc.includes("flight") ||
    desc.includes("parking")
  ) {
    return "Transportation";
  }
  if (
    desc.includes("shopping") ||
    desc.includes("store") ||
    desc.includes("mall") ||
    desc.includes("buy") ||
    desc.includes("purchase") ||
    desc.includes("cloth") ||
    desc.includes("fashion")
  ) {
    return "Shopping";
  }
  if (
    desc.includes("bills") ||
    desc.includes("utility") ||
    desc.includes("electricity") ||
    desc.includes("water") ||
    desc.includes("internet") ||
    desc.includes("phone") ||
    desc.includes("rent")
  ) {
    return "Bills & Utilities";
  }
  if (
    desc.includes("entertainment") ||
    desc.includes("movie") ||
    desc.includes("game") ||
    desc.includes("netflix") ||
    desc.includes("stream") ||
    desc.includes("concert") ||
    desc.includes("show")
  ) {
    return "Entertainment";
  }
  if (
    desc.includes("health") ||
    desc.includes("medical") ||
    desc.includes("pharmacy") ||
    desc.includes("doctor") ||
    desc.includes("hospital") ||
    desc.includes("medicine") ||
    desc.includes("clinic")
  ) {
    return "Health & Medical";
  }
  if (
    desc.includes("education") ||
    desc.includes("school") ||
    desc.includes("course") ||
    desc.includes("book") ||
    desc.includes("tuition") ||
    desc.includes("training")
  ) {
    return "Education";
  }
  if (
    desc.includes("subscription") ||
    desc.includes("membership") ||
    desc.includes("premium") ||
    desc.includes("monthly fee")
  ) {
    return "Subscriptions";
  }
  if (
    desc.includes("gym") ||
    desc.includes("fitness") ||
    desc.includes("sport") ||
    desc.includes("workout")
  ) {
    return "Fitness & Sports";
  }
  if (
    desc.includes("hotel") ||
    desc.includes("travel") ||
    desc.includes("vacation") ||
    desc.includes("trip")
  ) {
    return "Travel";
  }
  if (
    desc.includes("insurance") ||
    desc.includes("policy") ||
    desc.includes("premium")
  ) {
    return "Insurance";
  }
  if (
    desc.includes("gift") ||
    desc.includes("donation") ||
    desc.includes("charity")
  ) {
    return "Gifts & Donations";
  }

  return "Other";
}

// GET /api/ai/insights - Analyze spending patterns and generate AI insights
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("⚠️  GEMINI_API_KEY environment variable is not set");
      console.error("   Please add GEMINI_API_KEY to your .env.local file");
      console.error("   Get your API key from: https://ai.google.dev/");
      return NextResponse.json(
        {
          error: "Gemini API key not configured",
          message:
            "Please configure GEMINI_API_KEY in your environment variables. Get your free API key at https://ai.google.dev/",
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Fetch all expenses for the user
    const expenses = await Expense.find({
      userId: new mongoose.Types.ObjectId(user.id),
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch pockets for context
    const pockets = await Pocket.find({
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    if (expenses.length === 0) {
      return NextResponse.json({
        insights: [
          "You haven't recorded any expenses yet. Start tracking to get personalized insights!",
        ],
        recommendations: [
          "Add your first expense to begin analyzing your spending patterns.",
        ],
        totalSpent: 0,
        averagePerDay: 0,
        averagePerExpense: 0,
        totalExpenses: 0,
        topCategories: [],
        spendingTrend: "stable" as const,
        monthlyBreakdown: [],
        anomalies: [],
      });
    }

    // Calculate basic statistics
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = expenses.length;
    const averagePerExpense = totalSpent / totalExpenses;

    // Calculate days between first and last expense
    const firstExpense = expenses[expenses.length - 1];
    const lastExpense = expenses[0];
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date(lastExpense.createdAt).getTime() -
          new Date(firstExpense.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const averagePerDay = totalSpent / daysDiff;

    // Categorize expenses using AI
    const categoryMap = new Map<string, { amount: number; count: number }>();
    let aiCategorizationMap = new Map<string, string>();

    try {
      // Try AI categorization first
      aiCategorizationMap = await categorizeExpensesWithAI(
        expenses.map((exp) => ({
          description: exp.description,
          amount: exp.amount,
        }))
      );
      console.log(
        `✓ AI categorized ${aiCategorizationMap.size} expenses successfully`
      );
    } catch (error) {
      console.error("AI categorization failed, using fallback:", error);
    }

    // Build category map using AI categorization or fallback
    expenses.forEach((exp) => {
      const category =
        aiCategorizationMap.get(exp.description) ||
        fallbackCategorizeExpense(exp.description);
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + exp.amount,
        count: existing.count + 1,
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly breakdown
    const monthlyMap = new Map<
      string,
      { amount: number; count: number; name: string }
    >();
    expenses.forEach((exp) => {
      const date = new Date(exp.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const existing = monthlyMap.get(monthKey) || {
        amount: 0,
        count: 0,
        name: monthName,
      };
      monthlyMap.set(monthKey, {
        amount: existing.amount + exp.amount,
        count: existing.count + 1,
        name: monthName,
      });
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        month: data.name,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Determine spending trend
    let spendingTrend: "increasing" | "decreasing" | "stable" = "stable";
    if (monthlyBreakdown.length >= 2) {
      const recent = monthlyBreakdown.slice(-2);
      const change =
        ((recent[1].amount - recent[0].amount) / recent[0].amount) * 100;
      if (change > 10) spendingTrend = "increasing";
      else if (change < -10) spendingTrend = "decreasing";
    }

    // Detect anomalies (unusually large expenses)
    const amounts = expenses.map((e) => e.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2 * stdDev;

    const anomalies = expenses
      .filter((exp) => exp.amount > threshold)
      .slice(0, 5)
      .map((exp) => ({
        description: `Unusually large expense: ${
          exp.description
        } (₦${exp.amount.toFixed(2)})`,
        severity:
          exp.amount > mean + 3 * stdDev
            ? ("high" as const)
            : exp.amount > mean + 2 * stdDev
            ? ("medium" as const)
            : ("low" as const),
      }));

    // Prepare data for AI analysis
    const spendingData = {
      totalSpent,
      totalExpenses,
      averagePerExpense,
      averagePerDay,
      topCategories: topCategories.map((c) => ({
        category: c.category,
        amount: c.amount,
        percentage: ((c.amount / totalSpent) * 100).toFixed(1),
      })),
      spendingTrend,
      monthlyBreakdown: monthlyBreakdown.slice(-6), // Last 6 months
      totalPockets: pockets.length,
      totalPocketBalance: pockets.reduce((sum, p) => sum + p.balance, 0),
    };

    // Generate AI insights using Gemini
    const prompt = `You are a financial advisor analyzing spending data. Provide insights and recommendations based on this data:

${JSON.stringify(spendingData, null, 2)}

Provide:
1. 3-5 key insights about spending patterns (be specific and actionable)
2. 3-5 personalized recommendations to improve financial health

Format your response as JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Be concise, practical, and encouraging. Use the currency symbol ₦ when mentioning amounts.`;

    let aiInsights: string[] = [];
    let aiRecommendations: string[] = [];

    try {
      // Try generating with multiple models as fallback
      const text = await generateWithFallback(prompt);

      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiInsights = parsed.insights || [];
        aiRecommendations = parsed.recommendations || [];
      } else {
        // Fallback: split by lines if JSON parsing fails
        const lines = text.split("\n").filter((line) => line.trim());
        aiInsights = lines
          .filter(
            (line) =>
              line.toLowerCase().includes("insight") ||
              line.toLowerCase().includes("spending") ||
              line.toLowerCase().includes("pattern")
          )
          .slice(0, 5);
        aiRecommendations = lines
          .filter(
            (line) =>
              line.toLowerCase().includes("recommend") ||
              line.toLowerCase().includes("suggest") ||
              line.toLowerCase().includes("should")
          )
          .slice(0, 5);
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Log more details for debugging
      if (aiError instanceof Error) {
        console.error("Error message:", aiError.message);

        // Check if it's an API key issue
        if (
          aiError.message.includes("API key") ||
          aiError.message.includes("API_KEY")
        ) {
          console.error("⚠️  GEMINI API KEY ISSUE:");
          console.error("   Please ensure your GEMINI_API_KEY is valid");
          console.error("   Get a new key at: https://ai.google.dev/");
          console.error("   Make sure to enable the Generative Language API");
        } else if (aiError.message.includes("not found")) {
          console.error("⚠️  MODEL AVAILABILITY ISSUE:");
          console.error("   All available models returned errors");
          console.error("   This might be a temporary API issue");
        }
      }
      // Fallback insights if AI fails
      aiInsights = [
        `You've spent ₦${totalSpent.toFixed(
          2
        )} across ${totalExpenses} expenses`,
        `Your average expense is ₦${averagePerExpense.toFixed(2)}`,
        `You're spending an average of ₦${averagePerDay.toFixed(2)} per day`,
      ];
      aiRecommendations = [
        "Review your top spending categories to identify areas for savings",
        "Set monthly spending limits for categories where you spend the most",
        "Track your expenses regularly to maintain awareness of your spending",
      ];
    }

    const analysis: SpendingAnalysis = {
      totalSpent,
      averagePerDay,
      averagePerExpense,
      totalExpenses,
      topCategories,
      spendingTrend,
      monthlyBreakdown,
      anomalies,
      insights: aiInsights,
      recommendations: aiRecommendations,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    return handleApiError(error, "Failed to generate insights");
  }
}
