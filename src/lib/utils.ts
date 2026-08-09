import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGlassyColor(bgClass?: string) {
  if (!bgClass) return "bg-blue-500/20 border border-blue-500/50";
  const colorMap: Record<string, string> = {
    "bg-red-500": "bg-red-500/20 border-red-500/50",
    "bg-orange-500": "bg-orange-500/20 border-orange-500/50",
    "bg-amber-500": "bg-amber-500/20 border-amber-500/50",
    "bg-emerald-500": "bg-emerald-500/20 border-emerald-500/50",
    "bg-cyan-500": "bg-cyan-500/20 border-cyan-500/50",
    "bg-blue-500": "bg-blue-500/20 border-blue-500/50",
    "bg-indigo-500": "bg-indigo-500/20 border-indigo-500/50",
    "bg-violet-500": "bg-violet-500/20 border-violet-500/50",
    "bg-fuchsia-500": "bg-fuchsia-500/20 border-fuchsia-500/50",
    "bg-rose-500": "bg-rose-500/20 border-rose-500/50",
  };
  return `${colorMap[bgClass] || "bg-blue-500/20 border-blue-500/50"} border`;
}
