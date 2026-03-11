"use client"
import React, { useState } from 'react';

export default function Page() {
    const [title, set_title] = useState<string>("")
    const [src, set_src] = useState<string>("")
    const [file, set_file] = useState<File|null>(null)
    const [tool_tip, set_tool_tip] = useState<string>("")
    const [status_message, set_status_message] = useState<string>("")

    async function onSubmit(event:React.SubmitEvent) {
        event.preventDefault();
        const formData = new FormData();
        
        if (file !== null)
            formData.append('file', file);
        
        formData.append('title', title);
        formData.append('src', src);
        formData.append('tool_tip', tool_tip);
        
        const response = await fetch("/api/admin/public_files", {
            method: "POST",
            body: formData
        });

        if (response.ok)
            set_status_message(`Created "${title}" public_file.`)
        else if (response.status === 404) {
            const data = await response.json();
            set_status_message(`Failed to create "${title}" public_file : ${data.error}`)
        }
    }

    return (
        <div>
            New Public File
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
                <button className='admin-style' type="submit">CREATE</button>
            </form>
            {status_message}
        </div>
    );
}


