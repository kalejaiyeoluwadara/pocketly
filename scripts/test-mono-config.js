/**
 * Mono Integration Test Script
 * Run this to verify your Mono configuration is correct
 * Usage: node scripts/test-mono-config.js
 */

// Load environment variables from .env.local
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv();

// Check environment variables
const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;
const MONO_PUBLIC_KEY = process.env.MONO_PUBLIC_KEY;
const NEXT_PUBLIC_MONO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;

console.log("\n🔍 Checking Mono Configuration...\n");

let hasErrors = false;

// Check Secret Key
if (!MONO_SECRET_KEY) {
  console.error("❌ MONO_SECRET_KEY is not set");
  hasErrors = true;
} else if (
  !MONO_SECRET_KEY.startsWith("test_sk_") &&
  !MONO_SECRET_KEY.startsWith("live_sk_")
) {
  console.warn(
    "⚠️  MONO_SECRET_KEY format looks incorrect (should start with test_sk_ or live_sk_)"
  );
} else {
  console.log("✅ MONO_SECRET_KEY is set");
}

// Check Public Key
if (!MONO_PUBLIC_KEY) {
  console.error("❌ MONO_PUBLIC_KEY is not set");
  hasErrors = true;
} else if (
  !MONO_PUBLIC_KEY.startsWith("test_pk_") &&
  !MONO_PUBLIC_KEY.startsWith("live_pk_")
) {
  console.warn(
    "⚠️  MONO_PUBLIC_KEY format looks incorrect (should start with test_pk_ or live_pk_)"
  );
} else {
  console.log("✅ MONO_PUBLIC_KEY is set");
}

// Check Next Public Key (for client-side)
if (!NEXT_PUBLIC_MONO_PUBLIC_KEY) {
  console.error(
    "❌ NEXT_PUBLIC_MONO_PUBLIC_KEY is not set (required for frontend)"
  );
  hasErrors = true;
} else if (
  !NEXT_PUBLIC_MONO_PUBLIC_KEY.startsWith("test_pk_") &&
  !NEXT_PUBLIC_MONO_PUBLIC_KEY.startsWith("live_pk_")
) {
  console.warn(
    "⚠️  NEXT_PUBLIC_MONO_PUBLIC_KEY format looks incorrect (should start with test_pk_ or live_pk_)"
  );
} else {
  console.log("✅ NEXT_PUBLIC_MONO_PUBLIC_KEY is set");
}

// Check if public keys match
if (
  MONO_PUBLIC_KEY &&
  NEXT_PUBLIC_MONO_PUBLIC_KEY &&
  MONO_PUBLIC_KEY !== NEXT_PUBLIC_MONO_PUBLIC_KEY
) {
  console.warn(
    "⚠️  MONO_PUBLIC_KEY and NEXT_PUBLIC_MONO_PUBLIC_KEY don't match"
  );
}

// Test Mono API connection (optional - just validates format)
async function testMonoConnection() {
  console.log("\n🌐 Mono Configuration Summary...\n");

  console.log("Environment:", MONO_SECRET_KEY?.startsWith("test_") ? "TEST" : "LIVE");
  console.log("Secret Key:", MONO_SECRET_KEY ? `${MONO_SECRET_KEY.substring(0, 15)}...` : "Not set");
  console.log("Public Key:", MONO_PUBLIC_KEY ? `${MONO_PUBLIC_KEY.substring(0, 15)}...` : "Not set");
  
  console.log("\n💡 Note: Actual API connection will be tested when you link a bank account.");
}

// Run tests
(async () => {
  if (!hasErrors) {
    await testMonoConnection();
  }

  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.log(
      "\n❌ Configuration has errors. Please fix them before proceeding.\n"
    );
    process.exit(1);
  } else {
    console.log(
      "\n✅ All checks passed! Mono integration is configured correctly.\n"
    );
    process.exit(0);
  }
})();
