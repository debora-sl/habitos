import {
  BikeIcon,
  BookOpenIcon,
  BrainIcon,
  DropletIcon,
  DumbbellIcon,
  HeartPulseIcon,
  MoonIcon,
  Music2Icon,
  PenLineIcon,
  SaladIcon,
  SproutIcon,
  SunIcon,
  type LucideIcon,
} from "lucide-react";

export const HABIT_COLOR_OPTIONS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export type HabitColorName = (typeof HABIT_COLOR_OPTIONS)[number];

export const DEFAULT_HABIT_COLOR: HabitColorName = "chart-1";

export function isHabitColorName(value: string): value is HabitColorName {
  return (HABIT_COLOR_OPTIONS as readonly string[]).includes(value);
}

export function getHabitColorVar(color: string) {
  const colorName = isHabitColorName(color) ? color : DEFAULT_HABIT_COLOR;
  return `var(--${colorName})`;
}

export const HABIT_ICON_OPTIONS = [
  "Sprout",
  "Dumbbell",
  "BookOpen",
  "Droplet",
  "Moon",
  "Sun",
  "HeartPulse",
  "Brain",
  "PenLine",
  "Music2",
  "Bike",
  "Salad",
] as const;

export type HabitIconName = (typeof HABIT_ICON_OPTIONS)[number];

export const DEFAULT_HABIT_ICON: HabitIconName = "Sprout";

const HABIT_ICONS: Record<HabitIconName, LucideIcon> = {
  Sprout: SproutIcon,
  Dumbbell: DumbbellIcon,
  BookOpen: BookOpenIcon,
  Droplet: DropletIcon,
  Moon: MoonIcon,
  Sun: SunIcon,
  HeartPulse: HeartPulseIcon,
  Brain: BrainIcon,
  PenLine: PenLineIcon,
  Music2: Music2Icon,
  Bike: BikeIcon,
  Salad: SaladIcon,
};

export function isHabitIconName(value: string): value is HabitIconName {
  return (HABIT_ICON_OPTIONS as readonly string[]).includes(value);
}

export function getHabitIcon(icon: string): LucideIcon {
  return isHabitIconName(icon) ? HABIT_ICONS[icon] : HABIT_ICONS[DEFAULT_HABIT_ICON];
}
