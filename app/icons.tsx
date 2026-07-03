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
