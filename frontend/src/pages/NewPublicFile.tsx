"use client"
import React, { useState } from 'react';
import { apiFetch } from '@/lib/auth';

export default function NewPublicFile() {
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [toolTip, setToolTip] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    if (file !== null) formData.append('file', file);
    formData.append('title', title);
    formData.append('src', src);
    formData.append('tool_tip', toolTip);

    const response = await apiFetch("/api/admin/public_files", { method: "POST", body: formData });
    if (response.ok)
      setStatusMessage(`Created "${title}" public file.`);
    else {
      const data = await response.json().catch(() => ({}));
      setStatusMessage(`Failed to create "${title}" public file : ${data.error || ''}`);
    }
  }

  return (
    <div>
      New Public File
      <form onSubmit={onSubmit}>
        SRC: {src}<br />
        <label>Public File:</label>
        <input className='admin-style' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length == 1) {
            setFile(e.target.files[0]);
            setSrc(e.target.files[0].name);
          }
        }} type="file" /><br />
        <label>Title:</label>
        <input type="text" onChange={e => setTitle(e.target.value)} className='admin-style' value={title} /><br />
        <label>Tool Tip:</label>
        <textarea onChange={e => setToolTip(e.target.value)} className='admin-style w-full' value={toolTip} /><br />
        <button className='admin-style' type="submit">CREATE</button>
      </form>
      {statusMessage}
    </div>
  );
}
