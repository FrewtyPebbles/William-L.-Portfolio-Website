"use client"
import React, { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/lib/auth';

interface Resume {
  id: number;
  title: string;
  src: string;
  nav_description: string;
}

export default function EditResume() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [navDescription, setNavDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/resumes").then(async res => {
      if (!res.ok) return;
      const resumes: Resume[] = await res.json();
      const r = resumes.find(r => r.id === Number(id));
      if (!r) return;
      setTitle(r.title);
      setSrc(r.src);
      setNavDescription(r.nav_description);
      setLoaded(true);
    });
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id!);
    if (file !== null) formData.append('file', file);
    formData.append('title', title);
    formData.append('src', src);
    formData.append('nav_description', navDescription);

    const response = await apiFetch("/api/admin/resumes", { method: "PUT", body: formData });
    if (response.ok)
      setStatusMessage(`Updated "${title}" resume.`);
    else {
      const data = await response.json().catch(() => ({}));
      setStatusMessage(`Failed to update "${title}" resume : ${data.error || ''}`);
    }
  }

  if (!loaded) return <>LOADING</>;

  return (
    <div>
      Edit Resume
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
        <button className='admin-style' type="submit">UPDATE</button>
      </form>
      {statusMessage}
    </div>
  );
}
