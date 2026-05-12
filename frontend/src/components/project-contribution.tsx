"use client"
import { ChangeEvent, useRef } from "react";

interface Contributor {
  name: string;
  githubUserName: string;
}

interface FullContribution {
  id?: number;
  level: string;
  description: string;
  contributor: Contributor;
}

interface Props {
  contribution: FullContribution;
  onUpdate: (contribution: FullContribution | null) => void;
}

const levels = ["EXTRA_SMALL", "SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE", "EVERYTHING", "NON_APPLICABLE"];

export function ProjectContribution({ contribution, onUpdate }: Props) {
  const errorMsg = useRef("");

  function onChange(field: string, e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) {
    if (field === "level") {
      if (!levels.includes(e.target.value)) {
        errorMsg.current = `${e.target.value} is not a valid contribution level.`;
        return;
      }
      contribution.level = e.target.value;
    }
    if (field === "description") contribution.description = e.target.value;
    if (field === "github_username") contribution.contributor.githubUserName = e.target.value;
    if (field === "name") contribution.contributor.name = e.target.value;
    errorMsg.current = "";
    onUpdate(contribution);
  }

  return (
    <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
      <div>
        Level:
        <select className="admin-style" onChange={e => onChange("level", e)} value={contribution.level || "EVERYTHING"}>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        GitHub Username:
        <input onChange={e => onChange("github_username", e)} className='admin-style' type="text" value={contribution.contributor.githubUserName} />
      </div>
      <div>
        Name:
        <input onChange={e => onChange("name", e)} className='admin-style' type="text" value={contribution.contributor.name} />
      </div>
      <div>
        Description:
        <textarea onChange={e => onChange("description", e)} className='admin-style' value={contribution.description} />
      </div>
      <div>
        <button onClick={() => onUpdate(null)} className='bg-red-500! admin-style' type="button">Remove</button>
      </div>
      <div className="text-red-500">{errorMsg.current}</div>
    </div>
  );
}
