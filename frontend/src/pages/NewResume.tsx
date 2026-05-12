"use client"
import React, { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/auth';

export default function NewResume() {
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [navDescription, setNavDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    if (file !== null) formData.append('file', file);
    formData.append('title', title);
    formData.append('src', src);
    formData.append('nav_description', navDescription);

    const response = await apiFetch("/api/admin/resumes", { method: "POST", body: formData });
    if (response.ok)
      setStatusMessage(`Created "${title}" resume.`);
    else {
      const data = await response.json().catch(() => ({}));
      setStatusMessage(`Failed to create "${title}" resume : ${data.error || ''}`);
    }
  }

  return (
    <div>
      New Resume
      <form onSubmit={onSubmit}>
        SRC: {src}<br />
        <label>Resume File (.pdf preferred):</label>
        <input className='admin-style' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length == 1) {
            setFile(e.target.files[0]);
            setSrc(e.target.files[0].name);
          }
        }} type="file" /><br />
        <label>Title:</label>
        <input type="text" onChange={e => setTitle(e.target.value)} className='admin-style' value={title} /><br />
        <label>Nav Description:</label>
        <textarea onChange={e => setNavDescription(e.target.value)} className='admin-style w-full' value={navDescription} /><br />
        <button className='admin-style' type="submit">CREATE</button>
      </form>
      {statusMessage}
    </div>
  );
}
