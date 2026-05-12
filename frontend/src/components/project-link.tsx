"use client"
import { ChangeEvent } from "react";

interface ProjectSubLink {
  id?: number;
  title: string;
  description: string;
  link: string;
  projectID?: number;
}

interface ProjectLinkProps {
  link: ProjectSubLink;
  onUpdate: (link: ProjectSubLink | null) => void;
}

export function ProjectLink({ link, onUpdate }: ProjectLinkProps) {
  function onChange(field: string, e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (field === "title") link.title = e.target.value;
    if (field === "description") link.description = e.target.value;
    if (field === "link") link.link = e.target.value;
    onUpdate(link);
  }

  return (
    <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
      <div>
        Title:
        <input onChange={e => onChange("title", e)} className='admin-style' type="text" value={link.title} />
      </div>
      <div>
        Link:
        <input onChange={e => onChange("link", e)} className='admin-style' type="text" value={link.link} />
      </div>
      <div>
        Description:
        <textarea onChange={e => onChange("description", e)} className='admin-style' value={link.description} />
      </div>
      <div>
        <button onClick={() => onUpdate(null)} className='bg-red-500! admin-style' type="button">Remove</button>
      </div>
    </div>
  );
}
