import {
  BookOpen,
  Headphones,
  Home,
  Library,
  Link2,
  Mic,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Single source of truth for the top navigation and mobile menu. */
export const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Mock Tests", to: "/mock-tests", icon: Sparkles },
  { label: "Reading", to: "/reading", icon: BookOpen },
  { label: "Listening", to: "/listening", icon: Headphones },
  { label: "Speaking", to: "/speaking", icon: Mic },
  { label: "Writing", to: "/writing", icon: PenLine },
  { label: "Dictionary", to: "/dictionary", icon: Library },
  { label: "Links", to: "/links", icon: Link2 },
  { label: "Admin", to: "/admin", icon: ShieldCheck },
];
