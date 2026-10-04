import React from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle,
  Clock,
  Compass,
  ControlSlider,
  Cpu,
  DashboardSpeed,
  Database,
  Dollar,
  Download,
  FireFlame,
  Flash,
  Gas,
  Globe,
  GraphDown,
  GraphUp,
  HeavyRain,
  HelpCircle,
  InfoCircle,
  Leaf,
  Lock,
  Medal,
  Menu,
  NavArrowDown,
  NavArrowLeft,
  NavArrowRight,
  NavArrowUp,
  Navigator,
  OpenBook,
  OpenNewWindow,
  Package,
  Page,
  Play,
  Printer,
  Rain,
  Refresh,
  ScaleFrameEnlarge,
  Search,
  SeaWaves,
  ShieldAlert,
  ShieldCheck,
  Spark,
  Sparks,
  StatsUpSquare,
  Terminal,
  Trophy,
  Upload,
  ViewGrid,
  WarningCircle,
  WarningTriangle,
  Wind,
  Xmark,
} from 'iconoir-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
}

/**
 * Authentic Iconoir-spec Ship Icon (1.5px stroke, round cap/join, 24x24 viewBox)
 */
export const Ship: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Waterline & Angular Bow/Stern Hull */}
    <path d="M2.5 16.5L4.5 20H19.5L21.5 16.5H2.5Z" />
    <path d="M1 16.5H23" />
    {/* Bridge / Wheelhouse Superstructure */}
    <path d="M13 10H18V16.5H13V10Z" />
    <path d="M15 7V10" />
    {/* Container / Cargo Stack */}
    <path d="M5 13H11V16.5H5V13Z" />
    <path d="M6 9.5H10V13H6V9.5Z" />
  </svg>
);

/**
 * Authentic Iconoir-spec Anchor Icon (1.5px stroke, round cap/join, 24x24 viewBox)
 */
export const Anchor: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Top Shackle Ring */}
    <circle cx="12" cy="5" r="2.5" />
    {/* Center Shank */}
    <path d="M12 7.5V20.5" />
    {/* Stock / Crossbar */}
    <path d="M7 11H17" />
    {/* Curved Flukes / Arms */}
    <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14" />
    {/* Fluke Bills */}
    <path d="M3 14H5" />
    <path d="M19 14H21" />
  </svg>
);

/**
 * Authentic Iconoir-spec Balance / Regulatory Scales Icon
 */
export const Scale: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3V21M12 21H8M12 21H16" />
    <path d="M5 7L12 5L19 7" />
    <path d="M2 13L5 7L8 13C8 14.6569 6.65685 16 5 16C3.34315 16 2 14.6569 2 13Z" />
    <path d="M16 13L19 7L22 13C22 14.6569 20.6569 16 19 16C17.3431 16 16 14.6569 16 13Z" />
  </svg>
);

// Native Iconoir Direct Exports
export {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle,
  Clock,
  Compass,
  ControlSlider,
  Cpu,
  DashboardSpeed,
  Database,
  Dollar,
  Download,
  FireFlame,
  Flash,
  Gas,
  Globe,
  GraphDown,
  GraphUp,
  HeavyRain,
  HelpCircle,
  InfoCircle,
  Leaf,
  Lock,
  Medal,
  Menu,
  NavArrowDown,
  NavArrowLeft,
  NavArrowRight,
  NavArrowUp,
  Navigator,
  OpenBook,
  OpenNewWindow,
  Package,
  Page,
  Play,
  Printer,
  Rain,
  Refresh,
  ScaleFrameEnlarge,
  Search,
  SeaWaves,
  ShieldAlert,
  ShieldCheck,
  Spark,
  Sparks,
  StatsUpSquare,
  Terminal,
  Trophy,
  Upload,
  ViewGrid,
  WarningCircle,
  WarningTriangle,
  Wind,
  Xmark,
};

// Aliases for seamless migration from previous icons to Iconoir equivalents
export const AlertTriangle = WarningTriangle;
export const AlertCircle = WarningCircle;
export const CheckCircle2 = CheckCircle;
export const ChevronLeft = NavArrowLeft;
export const ChevronRight = NavArrowRight;
export const ChevronDown = NavArrowDown;
export const ChevronUp = NavArrowUp;
export const Sliders = ControlSlider;
export const Gauge = DashboardSpeed;
export const Flame = FireFlame;
export const Fuel = Gas;
export const Waves = SeaWaves;
export const Zap = Flash;
export const Sparkles = Sparks;
export const BookOpen = OpenBook;
export const FileText = Page;
export const FileDown = Download;
export const ExternalLink = OpenNewWindow;
export const DollarSign = Dollar;
export const RefreshCw = Refresh;
export const RotateCcw = Refresh;
export const Navigation = Navigator;
export const Award = Medal;
export const CloudRain = Rain;
export const Info = InfoCircle;
export const Layers = ViewGrid;
export const TrendingUp = GraphUp;
export const TrendingDown = GraphDown;
export const BarChart3 = StatsUpSquare;
export const X = Xmark;
