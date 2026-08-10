"use client";

import type { LucideIcon } from "lucide-react";

import { createContext, useContext, useMemo, type ComponentType, type ReactNode } from "react";

import {
  Menu,
  Dot,
  Monitor,
  RectangleHorizontal,
  SquareLibrary,
  Clock,
  Star,
  ArrowUp,
  Loader,
  Users,
  Lock,
  Bell,
  Shield,
  Palette,
  Lightbulb,
  Rocket,
  Heart,
  Paintbrush,
  Brain,
  Globe,
  ImageIcon,
  Link,
  RotateCcw,
  Play,
  Pause,
  Pipette,
  Home,
  MessageCircle,
  Inbox,
  Pencil,
  SkipForward,
  CornerDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Copy,
  Mail,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { ChevronRightIcon, ChevronDownIcon, Cross2Icon, CopyIcon, SunIcon, MoonIcon, DotFilledIcon, GearIcon, PlusIcon, ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon, EnvelopeClosedIcon, PersonIcon, CheckIcon } from "@radix-ui/react-icons";

export interface IconComponentProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export type IconComponent = ComponentType<IconComponentProps> | LucideIcon;

export type IconName =
  | "chevron-right" | "chevron-down" | "x" | "copy" | "menu" | "dot"
  | "monitor" | "sun" | "moon" | "rectangle-horizontal" | "circle"
  | "square-library" | "clock" | "star" | "settings"
  | "plus" | "arrow-left" | "arrow-right" | "arrow-up" | "search" | "loader"
  | "users" | "lock" | "mail" | "bell" | "shield" | "palette"
  | "lightbulb" | "rocket" | "heart" | "paintbrush" | "brain"
  | "globe" | "user"
  | "image" | "link" | "check" | "rotate-ccw"
  | "play" | "pause" | "pipette"
  | "home" | "message-circle" | "inbox"
  | "pencil" | "skip-forward" | "corner-down-right";

export const defaultIcons: Record<IconName, IconComponent> = {
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "pipette": Pipette,
  "x": X,
  "copy": Copy,
  "menu": Menu,
  "dot": Dot,
  "monitor": Monitor,
  "sun": Sun,
  "moon": Moon,
  "rectangle-horizontal": RectangleHorizontal,
  "circle": Circle,
  "square-library": SquareLibrary,
  "clock": Clock,
  "star": Star,
  "settings": Settings,
  "plus": Plus,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "search": Search,
  "loader": Loader,
  "users": Users,
  "lock": Lock,
  "mail": Mail,
  "bell": Bell,
  "shield": Shield,
  "palette": Palette,
  "lightbulb": Lightbulb,
  "rocket": Rocket,
  "heart": Heart,
  "paintbrush": Paintbrush,
  "brain": Brain,
  "globe": Globe,
  "user": User,
  "image": ImageIcon,
  "link": Link,
  "check": Check,
  "rotate-ccw": RotateCcw,
  "play": Play,
  "pause": Pause,
  "home": Home,
  "message-circle": MessageCircle,
  "inbox": Inbox,
  "pencil": Pencil,
  "skip-forward": SkipForward,
  "corner-down-right": CornerDownRight,
};

const IconContext = createContext<Record<IconName, IconComponent> | null>(null);

/**
 * Returns a single icon component for the given name.
 * Falls back to the default (Lucide) set if no provider is present.
 */
function useIcon(name: IconName): IconComponent {
  const icons = useContext(IconContext);
  return (icons ?? defaultIcons)[name];
}

/**
 * Returns the full icon map.
 * Falls back to the default (Lucide) set if no provider is present.
 */
function useIcons(): Record<IconName, IconComponent> {
  const icons = useContext(IconContext);
  return icons ?? defaultIcons;
}

/**
 * Swap some or all icons for components from another library.
 * Names left out of `icons` keep their default (Lucide) component.
 */
function IconProvider({
  children,
  icons,
}: {
  children: ReactNode;
  icons?: Partial<Record<IconName, IconComponent>>;
}) {
  const value = useMemo(() => ({ ...defaultIcons, ...icons }), [icons]);
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

export { IconProvider, useIcon, useIcons };
