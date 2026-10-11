import { clsx, type ClassValue } from "./clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export function formatMs(ms: number) {
  return `${ms} ms`;
}

export function timeAgo(seconds: number) {
  if (seconds < 60) return `${seconds} seconds ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.floor(m / 60)}h ago`;
}
