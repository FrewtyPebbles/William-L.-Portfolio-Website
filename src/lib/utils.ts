import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function usePrefersDark(window:Window) {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}