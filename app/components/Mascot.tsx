export type MascotMood = "happy" | "sleepy" | "thinking" | "celebrating";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const COIN = "#FBBF24";
const COIN_DARK = "#D97706";
const INK = "#312E81";

const bodyAnim: Record<MascotMood, string> = {
  happy: "mascot-bob 2.4s ease-in-out infinite",
  sleepy: "mascot-breathe 3s ease-in-out infinite",
  thinking: "mascot-sway 3.2s ease-in-out infinite",
  celebrating: "mascot-hop 1s ease-in-out infinite",
};

/**
 * "Pocket" — Pocketly's mascot. Animated entirely with CSS transforms
 * (no JS per frame) so it stays smooth on low-end devices.
 */
export default function Mascot({
  mood = "happy",
  size = 120,
  className,
}: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`mascot ${className ?? ""}`}
      role="img"
      aria-label={`Pocket the mascot, ${mood}`}
    >
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="mascot-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <radialGradient id="mascot-coin" cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor={COIN} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="192" rx="46" ry="7" fill="black" opacity="0.08" />

      <g
        className="mascot-body"
        style={{ animation: bodyAnim[mood], transformOrigin: "100px 185px" }}
      >
        {/* feet */}
        <ellipse cx="72" cy="176" rx="14" ry="8" fill="#4338CA" />
        <ellipse cx="128" cy="176" rx="14" ry="8" fill="#4338CA" />

        {/* body */}
        <rect x="35" y="68" width="130" height="110" rx="40" fill="url(#mascot-body)" />
        {/* soft top highlight */}
        <ellipse cx="80" cy="92" rx="34" ry="14" fill="white" opacity="0.12" />

        {/* belly */}
        <path
          d="M58 118 Q100 100 142 118 L142 161 Q100 178 58 161 Z"
          fill="#C7D2FE"
        />

        {/* flap */}
        <path d="M45 70 Q100 18 155 70 Q140 96 100 96 Q60 96 45 70 Z" fill="url(#mascot-flap)" />
        <path
          d="M55 66 Q100 30 145 66"
          stroke="white"
          strokeOpacity="0.4"
          strokeDasharray="1 8"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* snap button */}
        <circle cx="100" cy="80" r="7.5" fill="url(#mascot-coin)" stroke={COIN_DARK} strokeWidth="1.5" />
        <text x="100" y="84" textAnchor="middle" fontSize="9" fontWeight="800" fill={COIN_DARK}>
          ₦
        </text>

        <Face mood={mood} />
      </g>

      <MoodExtras mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <>
        <path d="M62 128 Q75 137 88 128" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M112 128 Q125 137 138 128" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <ellipse cx="100" cy="153" rx="6" ry="4.5" fill={INK} opacity="0.7" />
        <Blush />
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        <path d="M60 117 L88 113" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <Eye cx={75} cy={130} pupilOffset={{ x: 3.5, y: -3.5 }} />
        <Eye cx={125} cy={130} pupilOffset={{ x: 3.5, y: -3.5 }} />
        <path d="M90 154 L112 152" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </>
    );
  }

  if (mood === "celebrating") {
    return (
      <>
        <path d="M64 124 L75 133 L86 124" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M114 124 L125 133 L136 124" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M78 146 Q100 172 122 146 Q100 158 78 146 Z" fill={INK} />
        <Blush />
      </>
    );
  }

  // happy (default)
  return (
    <>
      <Eye cx={75} cy={129} blink />
      <Eye cx={125} cy={129} blink />
      <path d="M80 150 Q100 163 120 150" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
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
    <g
      style={
        blink
          ? {
              animation: "mascot-blink 3.6s ease-in-out infinite",
              transformOrigin: `${cx}px ${cy}px`,
            }
          : undefined
      }
    >
      <circle cx={cx} cy={cy} r="13" fill="white" />
      <circle cx={cx + pupilOffset.x} cy={cy + pupilOffset.y} r="6.5" fill={INK} />
      <circle cx={cx + pupilOffset.x + 2.5} cy={cy + pupilOffset.y - 2.5} r="2" fill="white" />
    </g>
  );
}

function Blush() {
  return (
    <>
      <ellipse cx="59" cy="144" rx="7.5" ry="4.5" fill="#F472B6" opacity="0.45" />
      <ellipse cx="141" cy="144" rx="7.5" ry="4.5" fill="#F472B6" opacity="0.45" />
    </>
  );
}

function MoodExtras({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <>
        {["Z", "Z", "z"].map((letter, i) => (
          <text
            key={i}
            x={142 + i * 11}
            y={58 - i * 9}
            fontSize={15 - i * 2}
            fontWeight={800}
            fill="#4F46E5"
            style={{
              animation: `mascot-float 2.4s ease-out ${i * 0.6}s infinite`,
            }}
          >
            {letter}
          </text>
        ))}
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={148 + i * 14}
            cy={48}
            r={5 - i * 0.5}
            fill="#4F46E5"
            opacity={0.9 - i * 0.25}
            style={{
              animation: `mascot-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </>
    );
  }

  if (mood === "celebrating") {
    return (
      <>
        {[
          { x: 30, delay: 0 },
          { x: 170, delay: 0.4 },
          { x: 55, delay: 0.8 },
          { x: 145, delay: 1.2 },
        ].map((coin, i) => (
          <g
            key={i}
            style={{
              animation: `mascot-coin 1.8s linear ${coin.delay}s infinite`,
            }}
          >
            <circle cx={coin.x} cy="0" r="6" fill="url(#mascot-coin)" stroke={COIN_DARK} strokeWidth="1.5" />
          </g>
        ))}
      </>
    );
  }

  return null;
}
