"use client";

import { useEffect, useRef, useState } from "react";

export type MascotMood =
  | "happy"
  | "sleepy"
  | "thinking"
  | "celebrating"
  | "counting"
  | "waving";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** Set false to disable tap/cursor interactivity (e.g. tiny sizes) */
  interactive?: boolean;
}

const COIN = "#FBBF24";
const COIN_DARK = "#D97706";
const INK = "#312E81";
const OUTLINE = "#3730A3";

const bodyAnim: Record<MascotMood, string> = {
  happy: "mascot-bob 2.4s ease-in-out infinite",
  sleepy: "mascot-breathe 3s ease-in-out infinite",
  thinking: "mascot-sway 3.2s ease-in-out infinite",
  celebrating: "mascot-hop 1s ease-in-out infinite",
  counting: "mascot-bob 2s ease-in-out infinite",
  waving: "mascot-bob 1.8s ease-in-out infinite",
};

/**
 * "Pocket" — Pocketly's mascot. Ambient motion is pure CSS (GPU); the only
 * JS is cursor eye-tracking, written straight to a transform via refs so
 * there are no React re-renders per frame.
 */
export default function Mascot({
  mood = "happy",
  size = 120,
  className,
  interactive = true,
}: MascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const [burst, setBurst] = useState(0);
  const [tapped, setTapped] = useState(false);
  const canTrack = interactive && mood !== "sleepy" && mood !== "counting";

  // Cursor eye-tracking: direct DOM writes, rAF-throttled, zero re-renders.
  useEffect(() => {
    if (!canTrack) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const svg = svgRef.current;
        const pupils = pupilsRef.current;
        if (!svg || !pupils) return;
        const r = svg.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.62);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(dist / 40, 1) * 4.5;
        pupils.style.transform = `translate(${(dx / dist) * reach}px, ${
          (dy / dist) * reach
        }px)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [canTrack]);

  const onTap = () => {
    if (!interactive) return;
    navigator.vibrate?.(20);
    setBurst((b) => b + 1);
    setTapped(true);
    setTimeout(() => setTapped(false), 700);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 210"
      width={size}
      height={(size * 210) / 200}
      className={`mascot ${interactive ? "cursor-pointer select-none" : ""} ${
        className ?? ""
      }`}
      role="img"
      aria-label={`Pocket the mascot, ${mood}`}
      onPointerDown={onTap}
    >
      <defs>
        <linearGradient id="m-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="m-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <radialGradient id="m-coin" cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor={COIN} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="202" rx="46" ry="7" fill="black" opacity="0.08" />

      {/* tap reaction wrapper — separate from idle loop so they compose */}
      <g
        style={{
          animation: tapped ? "mascot-boing 0.7s ease-in-out" : undefined,
          transformOrigin: "100px 195px",
        }}
      >
        <g
          style={{ animation: bodyAnim[mood], transformOrigin: "100px 195px" }}
        >
          {/* feet */}
          <ellipse cx="72" cy="186" rx="14" ry="8" fill="#4338CA" />
          <ellipse cx="128" cy="186" rx="14" ry="8" fill="#4338CA" />

          {/* arms */}
          <Arm side="left" mood={mood} />
          <Arm side="right" mood={mood} />

          {/* body — sticker-style outline for a premium flat look */}
          <rect
            x="35"
            y="78"
            width="130"
            height="110"
            rx="40"
            fill="url(#m-body)"
            stroke={OUTLINE}
            strokeWidth="3"
          />
          <ellipse cx="80" cy="102" rx="34" ry="14" fill="white" opacity="0.14" />

          {/* belly */}
          <path
            d="M58 128 Q100 110 142 128 L142 171 Q100 188 58 171 Z"
            fill="#C7D2FE"
          />

          {/* flap */}
          <path
            d="M45 80 Q100 28 155 80 Q140 106 100 106 Q60 106 45 80 Z"
            fill="url(#m-flap)"
            stroke={OUTLINE}
            strokeWidth="3"
          />
          <path
            d="M55 76 Q100 40 145 76"
            stroke="white"
            strokeOpacity="0.4"
            strokeDasharray="1 8"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* snap button */}
          <g style={{ animation: tapped ? "mascot-spin 0.7s ease-out" : undefined, transformOrigin: "100px 90px" }}>
            <circle cx="100" cy="90" r="8" fill="url(#m-coin)" stroke={COIN_DARK} strokeWidth="1.5" />
            <text x="100" y="94" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={COIN_DARK}>
              ₦
            </text>
          </g>

          <Face mood={mood} tapped={tapped} pupilsRef={pupilsRef} />
        </g>
      </g>

      <MoodExtras mood={mood} />

      {/* coin burst on tap */}
      {burst > 0 && (
        <g key={burst}>
          {[-60, -30, 0, 30, 60].map((deg) => (
            <g
              key={deg}
              style={{
                animation: "mascot-pop 0.7s ease-out forwards",
                transformOrigin: "100px 90px",
                ["--pop-x" as string]: `${Math.sin((deg * Math.PI) / 180) * 55}px`,
                ["--pop-y" as string]: `${-40 - Math.cos((deg * Math.PI) / 180) * 30}px`,
              }}
            >
              <circle cx="100" cy="85" r="5.5" fill="url(#m-coin)" stroke={COIN_DARK} strokeWidth="1.2" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

function Arm({ side, mood }: { side: "left" | "right"; mood: MascotMood }) {
  const x = side === "left" ? 32 : 168;
  const wave =
    mood === "celebrating" || (mood === "waving" && side === "right");
  const toss = mood === "counting";
  return (
    <g
      style={{
        animation: wave
          ? `mascot-wave 0.6s ease-in-out infinite ${side === "left" ? "" : "0.3s"}`
          : toss
          ? `mascot-toss 2s ease-in-out infinite ${side === "left" ? "" : "1s"}`
          : undefined,
        transformOrigin: `${x}px 130px`,
      }}
    >
      <ellipse
        cx={x}
        cy={wave ? 118 : 140}
        rx="9"
        ry="16"
        fill="#4F46E5"
        stroke={OUTLINE}
        strokeWidth="3"
        transform={
          wave
            ? `rotate(${side === "left" ? -35 : 35} ${x} 130)`
            : `rotate(${side === "left" ? 18 : -18} ${x} 130)`
        }
      />
    </g>
  );
}

function Face({
  mood,
  tapped,
  pupilsRef,
}: {
  mood: MascotMood;
  tapped: boolean;
  pupilsRef: React.RefObject<SVGGElement>;
}) {
  // Tapped: delighted squint no matter the mood
  if (tapped) {
    return (
      <>
        <path d="M64 134 L75 143 L86 134" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M114 134 L125 143 L136 134" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M80 156 Q100 174 120 156 Q100 166 80 156 Z" fill={INK} />
        <Blush strong />
      </>
    );
  }

  if (mood === "sleepy") {
    return (
      <>
        <path d="M62 138 Q75 147 88 138" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M112 138 Q125 147 138 138" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <ellipse cx="100" cy="163" rx="6" ry="4.5" fill={INK} opacity="0.7" />
        <Blush />
      </>
    );
  }

  if (mood === "celebrating") {
    return (
      <>
        <path d="M64 134 L75 143 L86 134" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M114 134 L125 143 L136 134" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M78 156 Q100 182 122 156 Q100 168 78 156 Z" fill={INK} />
        <Blush strong />
      </>
    );
  }

  // counting: eyes follow the juggled coin (CSS-driven)
  if (mood === "counting") {
    return (
      <>
        <g style={{ animation: "mascot-blink 4s ease-in-out infinite", transformOrigin: "100px 139px" }}>
          <circle cx="75" cy="139" r="13" fill="white" />
          <circle cx="125" cy="139" r="13" fill="white" />
          <g style={{ animation: "mascot-eyes-follow 2s ease-in-out infinite" }}>
            <circle cx="75" cy="139" r="6.5" fill={INK} />
            <circle cx="125" cy="139" r="6.5" fill={INK} />
            <circle cx="77.5" cy="136.5" r="2" fill="white" />
            <circle cx="127.5" cy="136.5" r="2" fill="white" />
          </g>
        </g>
        <ellipse cx="100" cy="162" rx="6" ry="4.5" fill={INK} opacity="0.85" />
        <Blush />
      </>
    );
  }

  // happy + thinking share tracked eyes
  const thinking = mood === "thinking";
  return (
    <>
      {thinking && (
        <path d="M60 127 L88 123" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      )}
      <g style={{ animation: "mascot-blink 3.6s ease-in-out infinite", transformOrigin: "100px 139px" }}>
        <circle cx="75" cy="139" r="13" fill="white" />
        <circle cx="125" cy="139" r="13" fill="white" />
        {/* pupils — moved as one group by the eye-tracking effect */}
        <g ref={pupilsRef} style={{ transition: "transform 0.15s ease-out" }}>
          <circle cx={thinking ? 78 : 75} cy={thinking ? 136 : 139} r="6.5" fill={INK} />
          <circle cx={thinking ? 128 : 125} cy={thinking ? 136 : 139} r="6.5" fill={INK} />
          <circle cx={thinking ? 80.5 : 77.5} cy={thinking ? 133.5 : 136.5} r="2" fill="white" />
          <circle cx={thinking ? 130.5 : 127.5} cy={thinking ? 133.5 : 136.5} r="2" fill="white" />
        </g>
      </g>
      {thinking ? (
        <path d="M90 164 L112 162" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M80 160 Q100 173 120 160" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      )}
      <Blush />
    </>
  );
}

function Blush({ strong = false }: { strong?: boolean }) {
  return (
    <>
      <ellipse cx="59" cy="154" rx="7.5" ry="4.5" fill="#F472B6" opacity={strong ? 0.65 : 0.45} />
      <ellipse cx="141" cy="154" rx="7.5" ry="4.5" fill="#F472B6" opacity={strong ? 0.65 : 0.45} />
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
            y={68 - i * 9}
            fontSize={15 - i * 2}
            fontWeight={800}
            fill="#4F46E5"
            style={{ animation: `mascot-float 2.4s ease-out ${i * 0.6}s infinite` }}
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
            cy={58}
            r={5 - i * 0.5}
            fill="#4F46E5"
            opacity={0.9 - i * 0.25}
            style={{ animation: `mascot-dot 1.2s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </>
    );
  }

  if (mood === "counting") {
    return (
      <g style={{ animation: "mascot-juggle 2s ease-in-out infinite" }}>
        <g style={{ animation: "mascot-spin 1s linear infinite", transformOrigin: "100px 62px" }}>
          <circle cx="100" cy="62" r="9" fill="url(#m-coin)" stroke={COIN_DARK} strokeWidth="1.5" />
          <text x="100" y="66" textAnchor="middle" fontSize="10" fontWeight="800" fill={COIN_DARK}>
            ₦
          </text>
        </g>
      </g>
    );
  }

  if (mood === "waving") {
    return (
      <>
        {[
          { x: 38, y: 52, s: 1, delay: 0 },
          { x: 168, y: 40, s: 0.7, delay: 0.7 },
          { x: 152, y: 88, s: 0.5, delay: 1.4 },
        ].map((star, i) => (
          <g key={i} transform={`translate(${star.x} ${star.y}) scale(${star.s})`}>
            <path
              d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
              fill={COIN}
              style={{
                animation: `mascot-twinkle 2.1s ease-in-out ${star.delay}s infinite`,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            />
          </g>
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
          <g key={i} style={{ animation: `mascot-coin 1.8s linear ${coin.delay}s infinite` }}>
            <circle cx={coin.x} cy="0" r="6" fill="url(#m-coin)" stroke={COIN_DARK} strokeWidth="1.5" />
          </g>
        ))}
      </>
    );
  }

  return null;
}
