import { LucideProps } from "lucide-react";
import {
  Wallet,
  Plus,
  List,
  Target,
  Home,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Download,
  Smartphone,
  X,
  Loader2,
  Flame,
  Brain,
} from "lucide-react";

export const WalletIcon = (props: LucideProps) => <Wallet {...props} />;

/** Pocketly's own pouch — a mini of the mascot's pocket, coin snap and all */
export const PocketPouchIcon = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* body */}
    <rect x="3.5" y="8" width="17" height="13" rx="5" fill="currentColor" />
    {/* belly */}
    <path
      d="M6 14.5 Q12 12.5 18 14.5 L18 17.5 Q12 19.5 6 17.5 Z"
      fill="white"
      opacity="0.28"
    />
    {/* flap shadow + flap */}
    <path
      d="M4 8.6 Q12 2.6 20 8.6 Q17 12.4 12 12.4 Q7 12.4 4 8.6 Z"
      fill="black"
      opacity="0.22"
    />
    <path
      d="M4 8.6 Q12 2.6 20 8.6 Q17 12.4 12 12.4 Q7 12.4 4 8.6 Z"
      fill="currentColor"
      opacity="0.55"
    />
    {/* stitch */}
    <path
      d="M6.4 7.9 Q12 4.4 17.6 7.9"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.1"
      strokeDasharray="0.5 2"
      strokeLinecap="round"
    />
    {/* coin snap */}
    <circle cx="12" cy="9.6" r="2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.9" />
  </svg>
);

/* ---- Bottom-nav icons: custom, with a one-shot flourish when active ---- */

interface NavIconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

const navSvg = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Pockets — a pouch whose coin pops in when the tab activates */
export const PocketsNavIcon = ({ size = 20, className, active }: NavIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...navSvg}>
    <path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
    <path d="M3.5 9Q12 3.5 20.5 9" />
    <circle
      cx="12"
      cy="13.5"
      r="1.7"
      fill="currentColor"
      stroke="none"
      className={active ? "nav-pop" : ""}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  </svg>
);

/** Expenses — an outflow arrow that dips down on activate */
export const ExpensesNavIcon = ({ size = 20, className, active }: NavIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...navSvg}>
    <path d="M6 20h12" />
    <g className={active ? "nav-bob" : ""} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <path d="M12 4v10" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
    </g>
  </svg>
);

/** Needs — a target whose bullseye pulses on activate */
export const NeedsNavIcon = ({ size = 20, className, active }: NavIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...navSvg}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle
      cx="12"
      cy="12"
      r="1.3"
      fill="currentColor"
      stroke="none"
      className={active ? "nav-pop" : ""}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  </svg>
);

/** Insights — bars that rise in sequence on activate */
export const InsightsNavIcon = ({ size = 20, className, active }: NavIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...navSvg}>
    <path d="M4 20h16" />
    {[
      { x: 6.5, y: 12, h: 5, d: 0 },
      { x: 11, y: 8, h: 9, d: 0.08 },
      { x: 15.5, y: 14, h: 3, d: 0.16 },
    ].map((b, i) => (
      <rect
        key={i}
        x={b.x}
        y={b.y}
        width="2.4"
        height={b.h}
        rx="1"
        fill="currentColor"
        stroke="none"
        className={active ? "nav-bar" : ""}
        style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: `${b.d}s` }}
      />
    ))}
  </svg>
);

/** Custom edit icon — rounded pencil with a nib and a little sketch stroke */
export const EditPencilIcon = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* pencil body */}
    <path d="M16.5 4.5l3 3L9 18l-3.6.6L6 15z" />
    {/* nib tip */}
    <path d="M14.3 6.7l3 3" />
    {/* sketch underline */}
    <path
      d="M5 21c1.6-.9 3.4-.9 5 0"
      strokeWidth="1.6"
      className="origin-center transition-transform duration-300 group-hover:translate-x-0.5"
    />
  </svg>
);

/** Custom trash icon — lid tilts up on hover (needs `group` on the parent) */
export const TrashBinIcon = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* lid — pivots from the left on hover */}
    <g className="origin-[6px_6px] transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:-translate-y-0.5">
      <path d="M4 6.5h16" />
      <path d="M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
    </g>
    {/* can */}
    <path d="M6 7.5l.8 11a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9l.8-11" />
    {/* ribs */}
    <path d="M10 11v6M14 11v6" strokeWidth="1.5" />
  </svg>
);

/** Animated streak flame — layered licks flicker at different rhythms,
 * embers rise. Pure CSS animation (see globals.css flame-* keyframes). */
export const StreakFlameIcon = ({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="flame-outer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="flame-core" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* embers */}
    {[
      { cx: 8, delay: 0 },
      { cx: 13, delay: 0.7 },
      { cx: 17, delay: 1.3 },
    ].map((e, i) => (
      <circle
        key={i}
        cx={e.cx}
        cy="7"
        r="0.9"
        fill="#FB923C"
        className="flame-ember"
        style={{ animationDelay: `${e.delay}s` }}
      />
    ))}
    {/* outer flame */}
    <path
      d="M12 2.5c.6 2.8 2.6 4.6 4.2 6.6 1.3 1.6 2.3 3.3 2.3 5.4a6.5 6.5 0 1 1-13 0c0-2 .8-3.7 2-5.4.4 1.3 1.1 2.2 2.1 2.8C9.4 8.6 10.6 5.4 12 2.5z"
      fill="url(#flame-outer)"
      className="flame-lick"
    />
    {/* inner core */}
    <path
      d="M12 10.5c.9 1.7 2.7 2.7 2.7 4.9a2.7 2.7 0 1 1-5.4 0c0-1.1.4-2 1-2.9.3.6.7 1 1.1 1.2-.1-1.2.1-2.2.6-3.2z"
      fill="url(#flame-core)"
      className="flame-core"
    />
  </svg>
);

export const PlusIcon = (props: LucideProps) => <Plus {...props} />;
export const ListIcon = (props: LucideProps) => <List {...props} />;
export const TargetIcon = (props: LucideProps) => <Target {...props} />;
export const HomeIcon = (props: LucideProps) => <Home {...props} />;
export const TrendingDownIcon = (props: LucideProps) => (
  <TrendingDown {...props} />
);
export const TrendingUpIcon = (props: LucideProps) => (
  <TrendingUp {...props} />
);
export const CheckCircleIcon = (props: LucideProps) => (
  <CheckCircle2 {...props} />
);
export const CircleIcon = (props: LucideProps) => <Circle {...props} />;
export const AlertCircleIcon = (props: LucideProps) => (
  <AlertCircle {...props} />
);
export const FileTextIcon = (props: LucideProps) => <FileText {...props} />;
export const DownloadIcon = (props: LucideProps) => <Download {...props} />;
export const SmartphoneIcon = (props: LucideProps) => <Smartphone {...props} />;
export const XIcon = (props: LucideProps) => <X {...props} />;
export const Loader2Icon = (props: LucideProps) => <Loader2 {...props} />;
export const FlameIcon = (props: LucideProps) => <Flame {...props} />;
export const BrainIcon = (props: LucideProps) => <Brain {...props} />;
