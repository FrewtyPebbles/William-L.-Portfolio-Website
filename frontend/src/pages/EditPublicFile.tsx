"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/lib/auth';

interface PublicFile {
  id: number;
  title: string;
  src: string;
  tool_tip: string;
}

export default function EditPublicFile() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [toolTip, setToolTip] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/public_files").then(async res => {
      if (!res.ok) return;
      const files: PublicFile[] = await res.json();
      const f = files.find(f => f.id === Number(id));
      if (!f) return;
      setTitle(f.title);
      setSrc(f.src);
      setToolTip(f.tool_tip);
      setLoaded(true);
    });
  }, [id]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id!);
    if (file !== null) formData.append('file', file);
    formData.append('title', title);
    formData.append('src', src);
    formData.append('tool_tip', toolTip);

    const response = await apiFetch("/api/admin/public_files", { method: "PUT", body: formData });
    if (response.ok)
      setStatusMessage(`Updated "${title}" public file.`);
    else {
      const data = await response.json().catch(() => ({}));
      setStatusMessage(`Failed to update "${title}" public file : ${data.error || ''}`);
    }
  }

  if (!loaded) return <>LOADING</>;

  return (
    <div>
      Edit Public File
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
        <button className='admin-style' type="submit">UPDATE</button>
      </form>
      {statusMessage}
    </div>
  );
}
