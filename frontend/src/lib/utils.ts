import { UserData } from "@/types/users";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function usePrefersDark(window: Window) {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function get_asset_url(file_name: string): string {
  return `/static/uploads/${file_name}`
}

export function get_project_url(file_name: string): string {
  return `/static/projects/${file_name}`
}

export function get_resume_url(file_name: string): string {
  return `/static/resumes/${file_name}`
}

const API_BASE = import.meta.env.VITE_API_BASE || ''

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

export async function postComment(content:string, user:UserData|null, set_finished_msg:(msg:string)=>void, parent_id?:number, slug?:string) {
  if (user === null)
    return {
      status:"ERROR",
      message:"You cannot post a comment unless you are logged in."
    }
  if (slug === undefined)
    return {
      status:"ERROR",
      message:"You are trying to post a comment on an unknown page."
    }
  
  try {
    let response = await fetch(`/api/project/${slug}/comments`,
      {
        method:"POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({
          parent_id:parent_id,
          content:content
        })
      }
    )
    if (response.ok) {
      set_finished_msg("Comment posted.")
      setTimeout(() => {
        set_finished_msg("")
      }, 1000)
      return true;
    }
    else {
      return false;
    }
  } catch (error) {
    console.error(error)
    set_finished_msg("Failed to post comment.")
    setTimeout(() => {
      set_finished_msg("")
    }, 1000)
    return false;
  }
}