"use client";

import { motion } from "framer-motion";

export type MascotMood = "happy" | "sleepy" | "thinking" | "celebrating";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const BODY = "#6366F1";
const BODY_DARK = "#4F46E5";
const BELLY = "#A5B4FC";
const COIN = "#FBBF24";
const COIN_DARK = "#D97706";
const INK = "#312E81";

/**
 * "Pocket" — Pocketly's mascot. A friendly wallet/pouch character whose
 * face and motion change with `mood` so it can react to what's happening
 * on screen (empty states, loading, celebrations).
 */
export default function Mascot({
  mood = "happy",
  size = 120,
  className,
}: MascotProps) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Pocket the mascot, ${mood}`}
      animate={bodyAnimation(mood)}
      transition={bodyTransition(mood)}
      style={{ transformOrigin: "100px 178px" }}
    >
      <ellipse cx="100" cy="192" rx="46" ry="7" fill="black" opacity="0.08" />

      {/* feet */}
      <ellipse cx="72" cy="176" rx="14" ry="8" fill={BODY_DARK} />
      <ellipse cx="128" cy="176" rx="14" ry="8" fill={BODY_DARK} />

      {/* body */}
      <rect x="35" y="68" width="130" height="110" rx="38" fill={BODY} />

      {/* belly */}
      <path
        d="M58 118 Q100 100 142 118 L142 163 Q100 179 58 163 Z"
        fill={BELLY}
        opacity="0.9"
      />

      {/* flap */}
      <path
        d="M45 70 Q100 18 155 70 Q140 96 100 96 Q60 96 45 70 Z"
        fill={BODY_DARK}
      />
      <path
        d="M55 66 Q100 30 145 66"
        stroke="white"
        strokeOpacity="0.35"
        strokeDasharray="4 6"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* snap button */}
      <circle cx="100" cy="78" r="7" fill={COIN} stroke={COIN_DARK} strokeWidth="1.5" />

      <Face mood={mood} />
      <MoodExtras mood={mood} />
    </motion.svg>
  );
}

function bodyAnimation(mood: MascotMood) {
  switch (mood) {
    case "sleepy":
      return { scaleY: [1, 1.03, 1], rotate: [-2, -2, -2] };
    case "thinking":
      return { rotate: [-3, 3, -3] };
    case "celebrating":
      return { y: [0, -18, 0], scaleY: [1, 1.1, 0.92, 1], scaleX: [1, 0.95, 1.05, 1] };
    case "happy":
    default:
      return { y: [0, -6, 0] };
  }
}

function bodyTransition(mood: MascotMood) {
  switch (mood) {
    case "sleepy":
      return { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const };
    case "thinking":
      return { duration: 3, repeat: Infinity, ease: "easeInOut" as const };
    case "celebrating":
      return { duration: 0.9, repeat: Infinity, ease: "easeInOut" as const };
    case "happy":
    default:
      return { duration: 2, repeat: Infinity, ease: "easeInOut" as const };
  }
}

function Face({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <>
        <path d="M62 128 Q75 137 88 128" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M112 128 Q125 137 138 128" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="100" cy="153" rx="6" ry="4.5" fill={INK} opacity="0.7" />
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        <path d="M60 118 L88 114" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <Eye cx={75} cy={130} pupilOffset={{ x: 3, y: -3 }} />
        <Eye cx={125} cy={130} pupilOffset={{ x: 3, y: -3 }} />
        <path d="M90 154 L112 152" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </>
    );
  }

  if (mood === "celebrating") {
    return (
      <>
        <path d="M64 124 L75 133 L86 124" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M114 124 L125 133 L136 124" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M78 146 Q100 172 122 146 Q100 160 78 146 Z" fill={INK} />
        <Blush />
      </>
    );
  }

  // happy (default)
  return (
    <>
      <Eye cx={75} cy={129} blink />
      <Eye cx={125} cy={129} blink />
      <path d="M80 151 Q100 163 120 151" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      <Blush />
    </>
  );
}

function Eye({
  cx,
  cy,
  pupilOffset = { x: 0, y: 0 },
  blink = false,
}: {
  cx: number;
  cy: number;
  pupilOffset?: { x: number; y: number };
  blink?: boolean;
}) {
  return (
    <g>
      <motion.ellipse
        cx={cx}
        cy={cy}
        rx="13"
        ry="13"
        fill="white"
        animate={blink ? { ry: [13, 13, 13, 1.5, 13] } : undefined}
        transition={
          blink
            ? { duration: 3.2, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: "easeInOut" }
            : undefined
        }
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <circle cx={cx + pupilOffset.x} cy={cy + pupilOffset.y} r="6" fill={INK} />
    </g>
  );
}

function Blush() {
  return (
    <>
      <ellipse cx="60" cy="144" rx="7" ry="4" fill="#F472B6" opacity="0.5" />
      <ellipse cx="140" cy="144" rx="7" ry="4" fill="#F472B6" opacity="0.5" />
    </>
  );
}

function MoodExtras({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <>
        {["Z", "Z", "z"].map((letter, i) => (
          <motion.text
            key={i}
            x={140 + i * 10}
            y={60 - i * 8}
            fontSize={14 - i * 2}
            fontWeight={700}
            fill={BODY_DARK}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -14 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          >
            {letter}
          </motion.text>
        ))}
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={150 + i * 14}
            cy={50}
            r={5}
            fill={BODY_DARK}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </>
    );
  }

  if (mood === "celebrating") {
    const coins = [
      { x: 30, delay: 0 },
      { x: 170, delay: 0.3 },
      { x: 55, delay: 0.6 },
      { x: 145, delay: 0.9 },
    ];
    return (
      <>
        {coins.map((coin, i) => (
          <motion.circle
            key={i}
            cx={coin.x}
            r={6}
            fill={COIN}
            stroke={COIN_DARK}
            strokeWidth="1.5"
            initial={{ cy: -10, opacity: 0 }}
            animate={{ cy: [-10, 210], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: coin.delay,
              ease: "linear",
            }}
          />
        ))}
      </>
    );
  }

  return null;
}
