"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Project, PublicFile, Resume } from "@/generated/prisma";
import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onYes: () => void;
  onNo: () => void;
}

function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onYes,
  onNo,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onNo()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onNo}>
            No
          </Button>
          <Button variant="destructive" onClick={onYes}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default function AdminDashboard() {
  const [projects, set_projects] = useState<Project[]>([])
  const [resumes, set_resumes] = useState<Resume[]>([])
  const [public_files, set_public_files] = useState<PublicFile[]>([])
  const [delete_dialog_project, set_delete_dialog_project] = useState<{
    name:string,
    id:number
  }|null>(null);

  const [delete_dialog_resume, set_delete_dialog_resume] = useState<{
    name:string,
    id:number
  }|null>(null);

  const [delete_dialog_public_file, set_delete_dialog_public_file] = useState<{
    name:string,
    id:number
  }|null>(null);

  useEffect(() => {
    fetch("/api/admin/projects").then(async (res) => {
      if (res.ok) {
        let json = await res.json();
        set_projects(json);
      }
    });

    fetch("/api/admin/resumes").then(async (res) => {
      if (res.ok) {
        let json = await res.json();
        set_resumes(json);
      }
    });

    fetch("/api/admin/public_files").then(async (res) => {
      if (res.ok) {
        let json = await res.json();
        set_public_files(json);
      }
    });
  }, [delete_dialog_resume === null, delete_dialog_project === null]);

  function delete_project(id:number) {
    fetch("/api/admin/projects", {
      method:"DELETE",
      body:JSON.stringify({
        id:id
      })
    }).then(res => {
      if (res.ok) {
        set_delete_dialog_project(null);
      } else {
        console.error("Failed to delete project.");
      }
    });
  }

  function delete_resume(id:number) {
    fetch("/api/admin/resumes", {
      method:"DELETE",
      body:JSON.stringify({
        id:id
      })
    }).then(res => {
      if (res.ok) {
        set_delete_dialog_resume(null);
      } else {
        console.error("Failed to delete resume.");
      }
    });
  }

  function delete_public_file(id:number) {
    fetch("/api/admin/public_files", {
      method:"DELETE",
      body:JSON.stringify({
        id:id
      })
    }).then(res => {
      if (res.ok) {
        set_delete_dialog_public_file(null);
      } else {
        console.error("Failed to delete public file.");
      }
    });
  }

  return (
    <div>
      <ConfirmDialog 
        open={delete_dialog_project !== null}
        title={`Are you sure you want to delete ${delete_dialog_project?.name}?`}
        onYes={() => delete_dialog_project !== null ? 
          delete_project(delete_dialog_project?.id) : null}
        onNo={() => set_delete_dialog_project(null)}
      />
      <ConfirmDialog 
        open={delete_dialog_resume !== null}
        title={`Are you sure you want to delete ${delete_dialog_resume?.name}?`}
        onYes={() => delete_dialog_resume !== null ? 
          delete_resume(delete_dialog_resume?.id) : null}
        onNo={() => set_delete_dialog_resume(null)}
      />
      <ConfirmDialog 
        open={delete_dialog_public_file !== null}
        title={`Are you sure you want to delete ${delete_dialog_public_file?.name}?`}
        onYes={() => delete_dialog_public_file !== null ? 
          delete_public_file(delete_dialog_public_file?.id) : null}
        onNo={() => set_delete_dialog_public_file(null)}
      />
      {/* Projects table: */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <a
          href="/admin/portal/projects/new"
          className="bg-black text-white px-4 py-2"
        >
          New Project
        </a>
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
                <button 
                  type="button" 
                  className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={e => set_delete_dialog_project({name: p.title, id: p.id})}
                >
                  X
                </button>
              </td>
              <td className="p-2">{p.title}</td>
              <td className="text-center">{p.progress}</td>
              <td className="text-right p-2">
                <a
                  href={`/admin/portal/projects/${p.id}`}
                  className="underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-2 m-8" />
      {/* Resumes table: */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resumes</h2>
        <a
          href="/admin/portal/resumes/new"
          className="bg-black text-white px-4 py-2"
        >
          New Resume
        </a>
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
                <button 
                  type="button" 
                  className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={e => set_delete_dialog_resume({name: r.title, id: r.id})}
                >
                  X
                </button>
              </td>
              <td className="p-2">{r.title}</td>
              <td>{r.nav_description}</td>
              <td className="text-right p-2">
                <a
                  href={`/admin/portal/resumes/${r.id}`}
                  className="underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Public Files table: */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Public Files</h2>
        <a
          href="/admin/portal/public_files/new"
          className="bg-black text-white px-4 py-2"
        >
          New Public File
        </a>
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
          {public_files.map(pf => (
            <tr key={pf.id} className="border-b">
              <td>
                <button 
                  type="button" 
                  className="bg-red-500 hover:bg-red-700 p-2 hover:cursor-pointer"
                  onClick={e => set_delete_dialog_public_file({name: pf.title, id: pf.id})}
                >
                  X
                </button>
              </td>
              <td className="p-2">{pf.title}</td>
              <td>{pf.tool_tip}</td>
              <td className="text-right p-2">
                <a
                  href={`/admin/portal/public_files/${pf.id}`}
                  className="underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}