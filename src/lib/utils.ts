import { clsx, type ClassValue } from "clsx"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import OUTPUTS, {TerraformOutputs} from "./terraform_outputs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function usePrefersDark(window:Window) {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function is_prod():boolean {
  return Boolean(Object.keys(OUTPUTS).length && process.env.TF_VAR_ENVIRONMENT != "DEV")
}

export function get_asset_url(file_name:string):string {
  if (is_prod()) {
    return `https://${(OUTPUTS as TerraformOutputs).cdn_domain_name}/static/public/uploads/${file_name}`
  } else {
    return `/public/uploads/${file_name}`
  }
}