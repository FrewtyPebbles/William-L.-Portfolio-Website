"use client"
import React, { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectImage } from '@/components/project-image';
import { ProjectLink } from '@/components/project-link';
import { ProjectContribution } from '@/components/project-contribution';
import { apiFetch } from '@/lib/auth';

interface ProjectSubImage {
  id?: number;
  src: string;
  title: string;
  description: string;
  projectID?: number;
}

interface ProjectSubLink {
  id?: number;
  title: string;
  description: string;
  link: string;
  projectID?: number;
}

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

interface FullProject {
  id: number;
  slug: string;
  title: string;
  progress: string;
  nav_description: string;
  short_description: string;
  full_description: string;
  created_at: string;
  images: ProjectSubImage[];
  links: ProjectSubLink[];
  contributions: FullContribution[];
}

const progressOptions = ["PROTOTYPING", "DEVELOPMENT", "ALPHA", "BETA", "RELEASE"] as const;

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<FullProject | null>(null);
  const [images, setImages] = useState<{ image: ProjectSubImage; file: File | null }[]>([]);
  const [links, setLinks] = useState<ProjectSubLink[]>([]);
  const [contributions, setContributions] = useState<FullContribution[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [progress, setProgress] = useState("ALPHA");
  const [shortDescription, setShortDescription] = useState("");
  const [navDescription, setNavDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/projects").then(async res => {
      if (!res.ok) return;
      const projects: FullProject[] = await res.json();
      const p = projects.find(p => p.id === Number(id));
      if (!p) return;
      setProject(p);
      setImages(p.images.map(img => ({ image: img, file: null })));
      setLinks(p.links);
      setContributions(p.contributions);
      setTitle(p.title);
      setSlug(p.slug);
      setProgress(p.progress);
      setShortDescription(p.short_description);
      setNavDescription(p.nav_description);
      setFullDescription(p.full_description);
    });
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id!);

    images.forEach((item) => {
      if (item.file) formData.append('image_files', item.file);
      else formData.append('image_files', 'null');
      formData.append('images', JSON.stringify(item.image));
    });

    links.forEach(link => formData.append('links', JSON.stringify(link)));
    contributions.forEach(c => formData.append('contributions', JSON.stringify(c)));

    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('progress', progress);
    formData.append('short_description', shortDescription);
    formData.append('nav_description', navDescription);
    formData.append('full_description', fullDescription);

    const response = await apiFetch("/api/admin/projects", { method: "PUT", body: formData });

    if (response.ok)
      setStatusMessage(`Updated "${title}" project (${new Date()}).`);
    else {
      const data = await response.json().catch(() => ({}));
      setStatusMessage(`Failed to update "${title}" project (${new Date()}) : ${data.error || ''}`);
    }
  }

  if (!project) return <>LOADING</>;

  return (
    <div>
      {project.title}
      <form onSubmit={onSubmit}>
        <label>title:</label>
        <input onChange={e => setTitle(e.target.value)} className='admin-style' type="text" value={title} /><br />
        <label>slug:</label>
        <input onChange={e => setSlug(e.target.value)} className='admin-style' type="text" value={slug} /><br />
        <label>Progress:</label>
        <select className="admin-style" value={progress} onChange={e => setProgress(e.target.value)}>
          {progressOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select><br />

        <p>Images:</p>
        <button className='admin-style !bg-green-500' type='button' onClick={() => setImages([...images, { image: { src: "", description: "", title: "", projectID: project.id } as ProjectSubImage, file: null }])}>ADD</button>
        <div className='flex flex-wrap'>
          {images.map((item, i) => (
            <ProjectImage key={i} image={item} onUpdate={(img, f) => {
              if (img === null) setImages(prev => prev.filter((_, idx) => idx !== i));
              else setImages(prev => { const n = [...prev]; n[i] = { image: img, file: f }; return n; });
            }} />
          ))}
        </div>

        <p>Links:</p>
        <button className='admin-style !bg-green-500' type='button' onClick={() => setLinks([...links, { title: "", description: "", link: "", projectID: project.id } as ProjectSubLink])}>ADD</button>
        <div className='flex flex-wrap'>
          {links.map((link, i) => (
            <ProjectLink key={i} link={link} onUpdate={l => {
              if (l === null) setLinks(prev => prev.filter((_, idx) => idx !== i));
              else setLinks(prev => { const n = [...prev]; n[i] = l; return n; });
            }} />
          ))}
        </div>

        <p>Contributions:</p>
        <button className='admin-style !bg-green-500' type='button' onClick={() => setContributions([...contributions, { level: "EVERYTHING", description: "", contributor: { name: "", githubUserName: "" } }])}>ADD</button>
        <div className='flex flex-wrap'>
          {contributions.map((c, i) => (
            <ProjectContribution key={i} contribution={c} onUpdate={c2 => {
              if (c2 === null) setContributions(prev => prev.filter((_, idx) => idx !== i));
              else setContributions(prev => { const n = [...prev]; n[i] = c2; return n; });
            }} />
          ))}
        </div>
        <br />
        <label>Nav Description:</label>
        <textarea onChange={e => setNavDescription(e.target.value)} className='admin-style w-full' value={navDescription} /><br />
        <label>Short Description:</label>
        <textarea onChange={e => setShortDescription(e.target.value)} className='admin-style w-full' value={shortDescription} /><br />
        <label>Full Description .md:</label>
        <textarea onChange={e => setFullDescription(e.target.value)} className='admin-style w-full' value={fullDescription} /><br />
        <button className='admin-style' type="submit">UPDATE</button>
      </form>
      {statusMessage}
    </div>
  );
}
