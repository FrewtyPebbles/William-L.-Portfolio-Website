"use client"
import React, { FormEvent, useState } from 'react';

export default function Page() {
    const [title, set_title] = useState<string>("")
    const [src, set_src] = useState<string>("")
    const [file, set_file] = useState<File|null>(null)
    const [nav_description, set_nav_description] = useState<string>("")
    const [status_message, set_status_message] = useState<string>("")

    async function onSubmit(event:FormEvent) {
        event.preventDefault();
        const formData = new FormData();
        
        if (file !== null)
            formData.append('file', file);
        
        formData.append('title', title);
        formData.append('src', src);
        formData.append('nav_description', nav_description);
        
        const response = await fetch("/api/admin/resumes", {
            method: "POST",
            body: formData
        });

        if (response.ok)
            set_status_message(`Created "${title}" resume.`)
        else if (response.status === 404) {
            const data = await response.json();
            set_status_message(`Failed to create "${title}" resume : ${data.error}`)
        }
    }

    return (
        <div>
            New Resume
            <form onSubmit={onSubmit}>
                SRC : {src}
                <br />
                <label htmlFor="file">Resume File (.pdf preferred) : </label>
                <input className='admin-style' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length == 1) {
                        const selected_file = e.target.files[0]
                        set_file(selected_file)
                        set_src(`/${selected_file.name}`)
                    }
                }} type="file" name="file" />
                <br />
                <label htmlFor="title">Title : </label>
                <input type="text" onChange={e => set_title(e.target.value)} className='admin-style' name="nav_description" value={title}/>
                <br />
                <label htmlFor="nav_description">Nav Description : </label>
                <textarea onChange={e => set_nav_description(e.target.value)} className='admin-style w-full' name="nav_description" value={nav_description}/>
                <br />
                <button className='admin-style' type="submit">CREATE</button>
            </form>
            {status_message}
        </div>
    );
}


