import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger used across the UI. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Small helper to safely coerce any unknown value to a trimmed string. */
export function safeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

/** Safely coerce any unknown value to an array of strings. */
export function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => safeString(v))
    .filter((v) => v.length > 0);
}
