import { ProjectSubImage } from "@/generated/prisma";
import { ChangeEvent } from "react";

interface ProjectImageProps {
    image:{image:ProjectSubImage, file:File | null};
    onUpdate:(image:ProjectSubImage|null, file:File | null) => void; // null means it was removed
};

export function ProjectImage({image:{image, file}, onUpdate}:ProjectImageProps) {

    function handle_image_file_change(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length == 1) {
            const selected_file = e.target.files[0]
            file = selected_file
            image.src = `/uploads/${selected_file.name}`
            onUpdate(image, file);
        }
    }

    function onChange(field:string, e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        if (field === "title")
            image.title = e.target.value;
        if (field === "description")
            image.description = e.target.value;

        onUpdate(image, file);
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit max-w-100'>
        <div>
            Title :
            <input onChange={e=>onChange("title", e)} className='admin-style' type="text" name="title" value={image.title} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>onChange("description", e)} className='admin-style' name="description" id="" value={image.description} />
        </div>
        <div>
            Image File :
            <input onChange={handle_image_file_change} className='admin-style' type="file" name="image_file"/>
        </div>
        <div className='break-words'>
            SRC : {image.src}
        </div>
        <img src={file ? URL.createObjectURL(file) : (image.src == "" ? undefined : image.src )} alt="" className='h-50' />
        <div>
            <button onClick={e => onUpdate(null, null)} className='!bg-red-500 admin-style' type="button">Remove</button>
        </div>
    </div>
}