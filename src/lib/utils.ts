import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function usePrefersDark(window:Window) {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function get_asset_url(file_name:string):string {
  return `/static/uploads/${file_name}`
}