"use client"
import { Prisma, Project, ProjectProgress, ProjectSubImage, ProjectSubLink } from '@/generated/prisma';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

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
    const [images, set_images] = useState<{image:ProjectSubImage, file:File | null}[]>([]);
    const [links, set_links] = useState<ProjectSubLink[]>([]);
    const [title, set_title] = useState<string>("")
    const [slug, set_slug] = useState<string>("")
    const [progress, set_progress] = useState<ProjectProgress>(ProjectProgress.ALPHA)
    const [short_description, set_short_description] = useState<string>("")
    const [nav_description, set_nav_description] = useState<string>("")
    const [full_description, set_full_description] = useState<string>("")
    const [status_message, set_status_message] = useState<string>("")

    async function onSubmit(event:FormEvent) {
        event.preventDefault();
        const id = (await params).id;
        const formData = new FormData();
        
        formData.append('id', id);

        images.forEach((item, index) => {
            if (item.file) {
                // Option A: Use the same key to create an array of files
                formData.append('image_files', item.file);
                
                // Send the metadata as a stringified array or matched keys
                // This helps the server link item.file to item.image properties
                formData.append('images', JSON.stringify(item.image));
            }
        });

        links.forEach((link, index) => {
            if (link) {
                formData.append('links', JSON.stringify(link));
            }
        });

        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('progress', progress);
        formData.append('short_description', short_description);
        formData.append('nav_description', nav_description);
        formData.append('full_description', full_description);
        
        const response = await fetch("/api/admin/projects", {
            method: "PUT",
            body: formData
        });

        if (response.ok)
            set_status_message(`Updated "${title}" project.`)
        else if (response.status === 404) {
            const data = await response.json();
            set_status_message(`Failed to update "${title}" project : ${data.error}`)
        }
    }

    useEffect(() => {
        async function fetchProjects(id:number) {
            const res = await fetch("/api/admin/projects");
            if (!res.ok) throw new Error("Failed to fetch");
            let projects:FullProject[] = await res.json();
            for (let project of projects) {
                if (project.id === Number(id)) {
                    set_project(project);
                    let new_images = []
                    for (let image of project.images) {
                        new_images.push({
                            image:image,
                            file:null
                        });
                    }
                    set_images(new_images);
                    set_progress(project.progress);
                    set_links(project.links);
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
                <input onChange={e => set_title(e.target.value)} className='admin-style' type="text" name="title" value={title}/>
                <br />
                <label htmlFor="slug">slug : </label>
                <input
                 onChange={e => set_slug(e.target.value)}
                 className='admin-style'
                 type="text" 
                 name="slug" 
                 value={slug}
                />
                <br />
                <label htmlFor="progress">Progress : </label>
                <select
                    name='progress'
                    className="admin-style"
                    value={progress}
                    onChange={e => set_progress(e.target.value as ProjectProgress)}
                >
                    {progressOptions.map(option => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                </select>
                <br />
                {/* IMAGES */}
                <p>Images :</p>
                <button
                    className='
                    admin-style
                    !bg-green-500
                    '
                    onClick={e => {
                        let new_images = [...images];
                        new_images.push({
                            image:{
                                src: "",
                                description: "",
                                title: "",
                                projectID: project.id
                            } as ProjectSubImage,
                            file: null
                        });
                        set_images(new_images);
                    }}
                >ADD</button>
                <div className='flex flex-wrap'>
                    {images.map(({image, file}) => (
                        <ProjectImage 
                            key={image.id} 
                            image={{image, file}}
                            onUpdate={(edited_image, file) => {
                                if (edited_image === null) {
                                    // remove the image
                                    let new_images = []
                                    for (let im of images) {
                                        if (image.id !== im.image.id)
                                            new_images.push(im)
                                    }
                                    set_images(new_images);
                                } else {
                                    // change the image
                                    let new_images = [...images];
                                    for (let i = 0; i < images.length; i++) {
                                        if (image.id !== new_images[i].image.id) {
                                            new_images[i] = {
                                                image:edited_image,
                                                file:file
                                            };
                                        }
                                    }
                                    set_images(new_images);
                                }
                            }}
                        />
                    ))}
                </div>
                {/* LINKS */}
                <p>Links :</p>
                <button
                    className='
                    admin-style
                    !bg-green-500
                    '
                    onClick={e => {
                        let new_links = [...links];
                        new_links.push({
                            title:"",
                            description:"",
                            link:"",
                            projectID: project.id
                        } as ProjectSubLink);
                        set_links(new_links);
                    }}
                >ADD</button>
                <div className='flex flex-wrap'>
                    {links.map(link => (
                        <ProjectLink 
                            key={link.id} 
                            link={link}
                            onUpdate={(edited_link) => {
                                if (edited_link === null) {
                                    // remove the image
                                    let new_links = []
                                    for (let lnk of links) {
                                        if (link.id !== lnk.id)
                                            new_links.push(lnk)
                                    }
                                    set_links(new_links);
                                } else {
                                    // change the image
                                    let new_links = [...links];
                                    for (let i = 0; i < links.length; i++) {
                                        if (link.id !== new_links[i].id) {
                                            new_links[i] = edited_link;
                                        }
                                    }
                                    set_links(new_links);
                                }
                            }}
                        />
                    ))}
                </div>
                <br />
                <label htmlFor="nav_description">Nav Description : </label>
                <textarea onChange={e => set_nav_description(e.target.value)} className='admin-style w-full' name="nav_description" value={nav_description}/>
                <br />
                <label htmlFor="short_description">Short Description : </label>
                <textarea onChange={e => set_short_description(e.target.value)} className='admin-style w-full' name="short_description" value={short_description}/>
                <br />
                <label htmlFor="full_description">full Description .md : </label>
                <textarea onChange={e => set_full_description(e.target.value)} className='admin-style w-full' name="full_description" value={full_description}/>
                <br />
                <button className='admin-style' type="submit">UPDATE</button>
            </form>
            {status_message}
        </div>
        );
        else
            return <>LOADING</>
}

interface ProjectImageProps {
    image:{image:ProjectSubImage, file:File | null};
    onUpdate:(image:ProjectSubImage|null, file:File | null) => void; // null means it was removed
};

function ProjectImage({image:{image, file}, onUpdate}:ProjectImageProps) {
    const [title, set_title] = useState<string>(image.title)
    const [description, set_description] = useState<string>(image.description)
    const [src, set_src] = useState<string>(image.src)
    const [image_file, set_image_file] = useState<File | null>(null)
    const [preview_image, set_preview_image] = useState<string | null>(null)

    function handle_image_file_change(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length == 1) {
            const selected_file = e.target.files[0]
            set_image_file(selected_file)
            set_preview_image(URL.createObjectURL(selected_file))
            set_src(`/${selected_file.name}`)
            image.title = e.target.value;
            image.description = description;
            image.src = src
            onUpdate(image, image_file);
        }
    }

    function onChange(set_function:React.Dispatch<React.SetStateAction<string>>, e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        set_function(e.target.value);
        image.title = title;
        image.description = description;
        image.src = src
        onUpdate(image, image_file);
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
        <div>
            Title :
            <input onChange={e=>onChange(set_title, e)} className='admin-style' type="text" name="title" value={title} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>onChange(set_description, e)} className='admin-style' name="description" id="" value={description} />
        </div>
        <div>
            Image File :
            <input onChange={handle_image_file_change} className='admin-style' type="file" name="image_file"/>
        </div>
        <img src={preview_image === null ? image.src : preview_image} alt="" className='h-50' />
        <div>
            <input onClick={e => onUpdate(null, null)} className='!bg-red-500 admin-style' type="submit" value="Remove" />
        </div>
    </div>
}

interface ProjectLinkProps {
    link:ProjectSubLink;
    onUpdate:(image:ProjectSubLink|null) => void; // null means it was removed
};

function ProjectLink({link, onUpdate}:ProjectLinkProps) {
    const [title, set_title] = useState<string>(link.title);
    const [description, set_description] = useState<string>(link.description);
    const [link_href, set_link_href] = useState<string>(link.link);

    function onChange(set_function:React.Dispatch<React.SetStateAction<string>>, e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        set_function(e.target.value);
        link.title = title;
        link.description = description;
        link.link = link_href;
        onUpdate(link);
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
        <div>
            Title :
            <input onChange={e=>onChange(set_title, e)} className='admin-style' type="text" name="title" value={title} />
        </div>
        <div>
            Link :
            <input onChange={e=>onChange(set_link_href, e)} className='admin-style' type="text" name="link" value={link_href} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>onChange(set_description, e)} className='admin-style' name="description" id="" value={description} />
        </div>
        <div>
            <input onClick={e => onUpdate(null)} className='!bg-red-500 admin-style' type="submit" value="Remove" />
        </div>
    </div>
}
