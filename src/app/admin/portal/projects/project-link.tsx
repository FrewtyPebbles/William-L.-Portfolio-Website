import { ProjectSubLink } from "@/generated/prisma";
import { ChangeEvent } from "react";

interface ProjectLinkProps {
    link:ProjectSubLink;
    onUpdate:(link:ProjectSubLink|null) => void; // null means it was removed
};

export function ProjectLink({link, onUpdate}:ProjectLinkProps) {

    function onChange(field:string, e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        if (field === "title")
            link.title = e.target.value;
        if (field === "description")
            link.description = e.target.value;
        if (field === "link")
            link.link = e.target.value;
        onUpdate(link);
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
        <div>
            Title :
            <input onChange={e=>onChange("title", e)} className='admin-style' type="text" name="title" value={link.title} />
        </div>
        <div>
            Link :
            <input onChange={e=>onChange("link", e)} className='admin-style' type="text" name="link" value={link.link} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>onChange("description", e)} className='admin-style' name="description" id="" value={link.description} />
        </div>
        <div>
            <button onClick={e => onUpdate(null)} className='!bg-red-500 admin-style' type="button">Remove</button>
        </div>
    </div>
}
