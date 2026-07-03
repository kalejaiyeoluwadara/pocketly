"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DeleteIcon } from "lucide-react";

interface AmountPadProps {
  value: string; // expression like "1500" or "1500+800"
  onChange: (value: string) => void;
  suggestions?: number[];
  max?: number; // shake + block when evaluated amount exceeds this
}

export function evaluateAmount(expr: string): number {
  return expr
    .split("+")
    .reduce((sum, part) => sum + (parseFloat(part) || 0), 0);
}

function formatDisplay(n: number): string {
  return n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function AmountPad({
  value,
  onChange,
  suggestions = [],
  max,
}: AmountPadProps) {
  const [bump, setBump] = useState(0);
  const [shake, setShake] = useState(0);
  const total = evaluateAmount(value);
  const hasMath = value.includes("+");
  const lastPart = value.split("+").pop() || "";

  const vibrate = (ms = 8) => {
    if (typeof navigator !== "undefined") navigator.vibrate?.(ms);
  };

  const reject = () => {
    setShake((s) => s + 1);
    vibrate(60);
  };

  const press = (key: string) => {
    if (key === "⌫") {
      if (!value) return reject();
      onChange(value.slice(0, -1));
      vibrate();
      return;
    }
    if (key === ".") {
      if (lastPart.includes(".")) return reject();
      onChange(value + (lastPart === "" ? "0." : "."));
      vibrate();
      setBump((b) => b + 1);
      return;
    }
    // digit
    const decimals = lastPart.split(".")[1];
    if (decimals && decimals.length >= 2) return reject();
    if (lastPart.replace(".", "").length >= 9) return reject();
    const next = value + key;
    if (max !== undefined && evaluateAmount(next) > max) return reject();
    onChange(next);
    vibrate();
    setBump((b) => b + 1);
  };

  const addPlus = () => {
    if (!value || value.endsWith("+")) return reject();
    onChange(value + "+");
    vibrate();
  };

  const pickSuggestion = (n: number) => {
    if (max !== undefined && n > max) return reject();
    onChange(String(n));
    vibrate(15);
    setBump((b) => b + 1);
  };

  return (
    <div>
      {/* Amount display */}
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -6, 6, -3, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="mb-1 flex min-h-[64px] items-center justify-center"
      >
        <motion.span
          key={bump}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`font-display text-5xl font-bold tracking-tight ${
            total > 0
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
        >
          ₦{formatDisplay(total)}
        </motion.span>
      </motion.div>

      {/* Math expression readout */}
      <div className="mb-3 h-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
        {hasMath && `₦${value.split("+").filter(Boolean).map((p) => formatDisplay(parseFloat(p) || 0)).join(" + ₦")}`}
      </div>

      {/* Quick-amount chips */}
      {suggestions.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((n) => (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => pickSuggestion(n)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              ₦{formatDisplay(n)}
            </motion.button>
          ))}
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <motion.button
            key={key}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => press(key)}
            className="flex h-14 items-center justify-center rounded-2xl text-2xl font-medium text-zinc-800 transition-colors active:bg-zinc-100 dark:text-zinc-100 dark:active:bg-zinc-800"
          >
            {key === "⌫" ? <DeleteIcon size={22} /> : key}
          </motion.button>
        ))}
      </div>

      {/* + for quick math */}
      <div className="mt-1 flex justify-center">
        <motion.button
          type="button"
          animate={{ opacity: value ? 1 : 0.35 }}
          whileTap={{ scale: 0.9 }}
          onClick={addPlus}
          className="rounded-full px-5 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          + add another item
        </motion.button>
      </div>
    </div>
  );
}
