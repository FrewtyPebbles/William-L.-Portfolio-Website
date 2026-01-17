"use client"
import { Prisma, Project, ProjectProgress, ProjectSubImage, ProjectSubLink } from '@/generated/prisma';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

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

export default function Page(){
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
        const formData = new FormData();

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
            method: "POST",
            body: formData
        });

        if (response.ok)
            set_status_message(`Created "${title}" project (${new Date()})`)
        else if (response.status === 404) {
            const data = await response.json();
            set_status_message(`Failed to create "${title}" project (${new Date()}) : ${data.error}`)
        }
    }


    return (<div>
        New Project
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
                type='button'
                onClick={e => {
                    let new_images = [...images];
                    new_images.push({
                        image:{
                            src: "",
                            description: "",
                            title: "",
                        } as ProjectSubImage,
                        file: null
                    });
                    set_images(new_images);
                }}
            >ADD</button>
            <div className='flex flex-wrap'>
                {images.map(({image, file}, index) => (
                    <ProjectImage 
                        key={index} 
                        image={{image, file}}
                        onUpdate={(edited_image, updated_file) => {
                            if (edited_image === null) {
                                // remove the image
                                set_images(prevImages => prevImages.filter((_, i) => i !== index));
                            } else {
                                // change the image
                                set_images(prevImages => {
                                    const nextImages = [...prevImages];
                                    nextImages[index] = {
                                        image: edited_image,
                                        file: updated_file
                                    };
                                    return nextImages;
                                });
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
                type='button'
                onClick={e => {
                    let new_links = [...links];
                    new_links.push({
                        title:"",
                        description:"",
                        link:"",
                    } as ProjectSubLink);
                    set_links(new_links);
                }}
            >ADD</button>
            <div className='flex flex-wrap'>
                {links.map((link, index) => (
                    <ProjectLink 
                        key={index} 
                        link={link}
                        onUpdate={(edited_link) => {
                            if (edited_link === null) {
                                // remove the image
                                set_links(prevLinks => prevLinks.filter((_, i) => i !== index));
                            } else {
                                // change the image
                                set_links(prevLinks => {
                                    const nextLinks = [...prevLinks];
                                    nextLinks[index] = edited_link;
                                    return nextLinks;
                                });
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
            <button className='admin-style' type="submit">CREATE</button>
        </form>
        {status_message}
    </div>
    );
}

interface ProjectImageProps {
    image:{image:ProjectSubImage, file:File | null};
    onUpdate:(image:ProjectSubImage|null, file:File | null) => void; // null means it was removed
};

function ProjectImage({image:{image, file}, onUpdate}:ProjectImageProps) {

    function handle_image_file_change(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length == 1) {
            const selected_file = e.target.files[0]
            file = selected_file
            image.src = `/${selected_file.name}`
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

interface ProjectLinkProps {
    link:ProjectSubLink;
    onUpdate:(link:ProjectSubLink|null) => void; // null means it was removed
};

function ProjectLink({link, onUpdate}:ProjectLinkProps) {

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
