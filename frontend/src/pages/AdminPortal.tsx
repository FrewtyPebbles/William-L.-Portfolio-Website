"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/auth"

interface Project {
  id: number
  title: string
  progress: string
}

interface Resume {
  id: number
  title: string
  nav_description: string
}

interface PublicFile {
  id: number
  title: string
  tool_tip: string
}

export default function AdminPortal() {
  const [projects, setProjects] = useState<Project[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [publicFiles, setPublicFiles] = useState<PublicFile[]>([])

  const [deleteProject, setDeleteProject] = useState<{ name: string; id: number } | null>(null)
  const [deleteResume, setDeleteResume] = useState<{ name: string; id: number } | null>(null)
  const [deletePublicFile, setDeletePublicFile] = useState<{ name: string; id: number } | null>(null)

  function loadData() {
    apiFetch("/api/admin/projects").then(async r => { if (r.ok) setProjects(await r.json()) })
    apiFetch("/api/admin/resumes").then(async r => { if (r.ok) setResumes(await r.json()) })
    apiFetch("/api/admin/public_files").then(async r => { if (r.ok) setPublicFiles(await r.json()) })
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (deleteProject === null && deleteResume === null && deletePublicFile === null) return
    loadData()
  }, [deleteProject, deleteResume, deletePublicFile])

  function doDelete(path: string, id: number, cb: () => void) {
    apiFetch(path, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }).then(r => r.ok && cb())
  }

  return (
    <div>
      {/* Confirm Dialog */}
      {deleteProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md">
            <h2 className="text-lg font-bold">Delete {deleteProject.name}?</h2>
            <p className="text-sm text-gray-500 my-2">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end mt-4">
              <button className="border px-4 py-2" onClick={() => setDeleteProject(null)}>No</button>
              <button className="bg-red-600 text-white px-4 py-2" onClick={() => doDelete("/api/admin/projects", deleteProject.id, () => setDeleteProject(null))}>Yes</button>
            </div>
          </div>
        </div>
      )}
      {deleteResume && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md">
            <h2 className="text-lg font-bold">Delete {deleteResume.name}?</h2>
            <p className="text-sm text-gray-500 my-2">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end mt-4">
              <button className="border px-4 py-2" onClick={() => setDeleteResume(null)}>No</button>
              <button className="bg-red-600 text-white px-4 py-2" onClick={() => doDelete("/api/admin/resumes", deleteResume.id, () => setDeleteResume(null))}>Yes</button>
            </div>
          </div>
        </div>
      )}
      {deletePublicFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md">
            <h2 className="text-lg font-bold">Delete {deletePublicFile.name}?</h2>
            <p className="text-sm text-gray-500 my-2">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end mt-4">
              <button className="border px-4 py-2" onClick={() => setDeletePublicFile(null)}>No</button>
              <button className="bg-red-600 text-white px-4 py-2" onClick={() => doDelete("/api/admin/public_files", deletePublicFile.id, () => setDeletePublicFile(null))}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Link to="/admin/portal/projects/new" className="bg-black text-white px-4 py-2">New Project</Link>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th />
            <th className="text-left p-2">Title</th>
            <th>Progress</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id} className="border-b">
              <td>
                <button type="button" className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={() => setDeleteProject({ name: p.title, id: p.id })}>X</button>
              </td>
              <td className="p-2">{p.title}</td>
              <td className="text-center">{p.progress}</td>
              <td className="text-right p-2">
                <Link to={`/admin/portal/projects/${p.id}`} className="underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-2 m-8" />

      {/* Resumes */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resumes</h2>
        <Link to="/admin/portal/resumes/new" className="bg-black text-white px-4 py-2">New Resume</Link>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th />
            <th className="text-left p-2">Title</th>
            <th>Nav Description</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {resumes.map(r => (
            <tr key={r.id} className="border-b">
              <td>
                <button type="button" className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={() => setDeleteResume({ name: r.title, id: r.id })}>X</button>
              </td>
              <td className="p-2">{r.title}</td>
              <td>{r.nav_description}</td>
              <td className="text-right p-2">
                <Link to={`/admin/portal/resumes/${r.id}`} className="underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-2 m-8" />

      {/* Public Files */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Public Files</h2>
        <Link to="/admin/portal/public_files/new" className="bg-black text-white px-4 py-2">New Public File</Link>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th />
            <th className="text-left p-2">Title</th>
            <th>Tool Tip</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {publicFiles.map(pf => (
            <tr key={pf.id} className="border-b">
              <td>
                <button type="button" className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={() => setDeletePublicFile({ name: pf.title, id: pf.id })}>X</button>
              </td>
              <td className="p-2">{pf.title}</td>
              <td>{pf.tool_tip}</td>
              <td className="text-right p-2">
                <Link to={`/admin/portal/public_files/${pf.id}`} className="underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
