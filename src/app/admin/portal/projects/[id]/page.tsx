"use client"
import { Prisma, Project, ProjectProgress, ProjectSubImage } from '@/generated/prisma';
import React, { FormEvent, useEffect, useState } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

type FullProject = Prisma.ProjectGetPayload<{
    include: {
        links: true,
        project_sub_pages: true,
        contributions: {
        include: {
            contributor: true, // fetch the contributor for each contribution
        },
        },
        images: true
    },
}>;

const progressOptions = [
    ProjectProgress.PROTOTYPING,
    ProjectProgress.DEVELOPMENT,
    ProjectProgress.ALPHA,
    ProjectProgress.BETA,
    ProjectProgress.RELEASE
] as const

export default function Page({ params }: Props){
    const [project, set_project] = useState<FullProject|null>(null);
    const [images, set_images] = useState<ProjectSubImage[]>([]);
    const [title, set_title] = useState<string>("")
    const [slug, set_slug] = useState<string>("")
    const [short_description, set_short_description] = useState<string>("")
    const [nav_description, set_nav_description] = useState<string>("")
    const [full_description, set_full_description] = useState<string>("")

    function onSubmit(event:FormEvent) {
        event.preventDefault()
    }

    useEffect(() => {
        async function fetchProjects(id:number) {
            const res = await fetch("/api/admin/projects");
            if (!res.ok) throw new Error("Failed to fetch");
            let projects:FullProject[] = await res.json();
            for (let project of projects) {
                if (project.id === Number(id)) {
                    set_project(project);
                    set_images(project.images);
                    set_title(project.title);
                    set_slug(project.slug);
                    set_short_description(project.short_description);
                    set_nav_description(project.nav_description);
                    set_full_description(project.full_description);
                    return;
                }
            }
        }
        params.then(({id}) => {
            fetchProjects(Number(id));
        })
    }, [])


    if (project !== null)
        return (<div>
            {project.title}
            <form onSubmit={onSubmit}>
                <label htmlFor="title">title : </label>
                <input className='admin-style' type="text" name="title" value={title}/>
                <br />
                <label htmlFor="slug">slug : </label>
                <input className='admin-style' type="text" name="slug" value={slug}/>
                <br />
                <label htmlFor="progress">Progress : </label>
                <select
                    name='progress'
                    className="admin-style"
                    value={project.progress}
                >
                    {progressOptions.map(option => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                </select>
                <br />
                <p>Images :</p>
                <button
                    className='
                    admin-style
                    !bg-green-500
                    '
                    onClick={e => {
                        let new_images = [...images];
                        new_images.push({
                            src: "",
                            description: "",
                            title: "",
                            projectID: project.id
                        } as ProjectSubImage);
                        set_images(new_images);
                    }}
                >ADD</button>
                <div className='flex flex-wrap'>
                    {images.map(image => (
                        <ProjectImage 
                            key={image.id} 
                            image={image}
                            onUpdate={(edited_image) => {
                                if (edited_image === null) {
                                    // remove the image
                                    let new_images = []
                                    for (let im of images) {
                                        if (image.id !== im.id)
                                            new_images.push(im)
                                    }
                                    set_images(new_images);
                                } else {
                                    // change the image
                                    // TODO
                                }
                            }}
                        />
                    ))}
                </div>
                <br />
                <label htmlFor="nav_description">Nav Description : </label>
                <textarea className='admin-style w-full' name="nav_description" value={nav_description}/>
                <br />
                <label htmlFor="short_description">Short Description : </label>
                <textarea className='admin-style w-full' name="short_description" value={short_description}/>
                <br />
                <label htmlFor="full_description">full Description .md : </label>
                <textarea className='admin-style w-full' name="full_description" value={full_description}/>
                <br />
                <button className='admin-style' type="submit">UPDATE</button>
            </form>
        </div>
        );
        else
            return <>LOADING</>
}

interface ProjectImageProps {
    image:ProjectSubImage;
    onUpdate:(image:ProjectSubImage|null) => void; // null means it was removed
};

function ProjectImage({image, onUpdate}:ProjectImageProps) {
    const [title, set_title] = useState(image.title)
    const [description, set_description] = useState(image.description)
    const [image_file, set_image_file] = useState<File | null>(null)
    const [preview_image, set_preview_image] = useState<string | null>(null)

    function handle_image_file_change(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
        const selected_file = e.target.files[0]
        set_image_file(selected_file)
        set_preview_image(URL.createObjectURL(selected_file))
        }
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
        <div>
            Title :
            <input onChange={e=>{
                set_title(e.target.value);
                image.title = e.target.value;
                image.description = description;
                onUpdate(image);
            }} className='admin-style' type="text" name="title" value={title} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>{
                set_description(e.target.value);
                image.title = e.target.value;
                image.description = description;
                onUpdate(image);
            }} className='admin-style' name="description" id="" value={description} />
        </div>
        <div>
            Image File :
            <input onChange={handle_image_file_change} className='admin-style' type="file" name="image_file"/>
        </div>
        <img src={preview_image === null ? image.src : preview_image} alt="" className='h-50' />
        <div>
            <input onClick={e => onUpdate(null)} className='!bg-red-500 admin-style' type="submit" value="Remove" />
        </div>
    </div>
}
