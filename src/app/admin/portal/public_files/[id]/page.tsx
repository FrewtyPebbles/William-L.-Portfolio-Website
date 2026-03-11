"use client"
import { PublicFile } from '@/generated/prisma';
import React, { useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: Props) {
    const [public_file, set_public_file] = useState<PublicFile|null>(null);
    const [title, set_title] = useState<string>("")
    const [src, set_src] = useState<string>("")
    const [file, set_file] = useState<File|null>(null)
    const [tool_tip, set_tool_tip] = useState<string>("")
    const [status_message, set_status_message] = useState<string>("")

    async function onSubmit(event:React.SubmitEvent) {
        event.preventDefault();
        const id = (await params).id;
        const formData = new FormData();
        
        formData.append('id', id);

        if (file !== null)
            formData.append('file', file);

        formData.append('title', title);
        formData.append('src', src);
        formData.append('tool_tip', tool_tip);
        
        const response = await fetch("/api/admin/public_files", {
            method: "PUT",
            body: formData
        });

        if (response.ok)
            set_status_message(`Updated "${title}" public file.`)
        else if (response.status === 404) {
            const data = await response.json();
            set_status_message(`Failed to update "${title}" public file : ${data.error}`)
        }
    }

    useEffect(() => {
            async function fetchPublicFiles(id:number) {
                const res = await fetch("/api/admin/public_files");
                if (!res.ok) throw new Error("Failed to fetch");
                let public_files:PublicFile[] = await res.json();
                for (let public_file of public_files) {
                    if (public_file.id === Number(id)) {
                        set_public_file(public_file)
                        set_title(public_file.title);
                        set_src(public_file.src);
                        set_tool_tip(public_file.tool_tip);
                        return;
                    }
                }
            }
            params.then(({id}) => {
                fetchPublicFiles(Number(id));
            })
        }, [])

    return (
        <div>
            {public_file?.title}
            <form onSubmit={onSubmit}>
                SRC : {src}
                <br />
                <label htmlFor="file">Public File File : </label>
                <input className='admin-style' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length == 1) {
                        const selected_file = e.target.files[0]
                        set_file(selected_file)
                        set_src(`${selected_file.name}`)
                    }
                }} type="file" name="file" />
                <br />
                <label htmlFor="title">Title : </label>
                <input type="text" onChange={e => set_title(e.target.value)} className='admin-style' name="tool_tip" value={title}/>
                <br />
                <label htmlFor="tool_tip">Tool Tip : </label>
                <textarea onChange={e => set_tool_tip(e.target.value)} className='admin-style w-full' name="tool_tip" value={tool_tip}/>
                <br />
                <button className='admin-style' type="submit">UPDATE</button>
            </form>
            {status_message}
        </div>
    );
}


