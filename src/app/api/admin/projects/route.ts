import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import path from "path"
import { writeFile, unlink } from 'fs/promises';
import { ProjectProgress, ProjectSubImage, ProjectSubLink } from "@/generated/prisma";

export async function GET() {
  return NextResponse.json(
    await prisma.project.findMany({
      include: {
        contributions: {
            include: {
            contributor: true, // fetch the contributor for each contribution
            },
        },
        links: true,
        images: true,
        project_sub_pages: true,
      },
    })
  )
}

function required_res(field:string) {
  console.warn(`A ${field} was not included with the project, failing request.`)
  return NextResponse.json(
      { error: `A project ${field} must be supplied.` },
      { status: 400 }
  );
}

export async function POST(req: Request) {
  console.log(`Attempting to create project...`);
  
  const formData = await req.formData();
  
  const image_files = formData.getAll('image_files') as File[];

  const images_raw = formData.getAll('images') as string[];
  let images:ProjectSubImage[] = [];
  for (let raw_image of images_raw) {
    let image:ProjectSubImage = JSON.parse(raw_image);
    if (image.src === "" || image.src === "/")
      return required_res("image src");
    images.push(image);
  }

  const links_raw = formData.getAll('links') as string[];
  let links:ProjectSubLink[] = [];
  for (let raw_link of links_raw) {
    let link:ProjectSubLink = JSON.parse(raw_link);
    if (link.title === "")
      return required_res("link's title");
    if (link.link === "")
      return required_res("link's link field");
    links.push(link);
  }

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const progress = formData.get('progress') as ProjectProgress;
  const short_description = formData.get('short_description') as string;
  const nav_description = formData.get('nav_description') as string;
  const full_description = formData.get('full_description') as string;

  if (title == "")
    return required_res("title");

  if (slug == "")
    return required_res("slug");
  
  console.log(`Attempting to upload ${image_files.length} images`)
  for (let file of image_files) {
    if (file !== null) {
      // save the new file
      const buffer = Buffer.from(await file.arrayBuffer());
      const destinationPath = path.join(process.cwd(), 'public', 'uploads', file.name);
      await writeFile(destinationPath, buffer);
    }
  }
  
  return NextResponse.json(
    await prisma.project.create({ data:{
        title,
        slug,
        progress,
        short_description,
        nav_description,
        full_description,
        images:{
            createMany:{
              data:images
            },
        },
        links:{
          createMany:{
            data:links
          },
        }
    } })
  );
}

export async function PUT(req: Request) {
  console.log(`Attempting to update project...`);
  
  const formData = await req.formData();
  
  const id = Number(formData.get('id'));

  console.log(`Searching for project with id : ${id}`);

  const project = await prisma.project.findUnique({
        select:{
          images:{
            select:{
              id:true,
              src:true
            }
          },
        },
        where: { id }
    });

    if (!project) {
        return NextResponse.json(
            { error: 'The requested project does not exist.' },
            { status: 404 }
        );
    }

    console.log("Found Project");
        

  const image_files = formData.getAll('image_files') as File[];

  const images_raw = formData.getAll('images') as string[];
  let images:ProjectSubImage[] = [];
  for (let raw_image of images_raw) {
    let image:ProjectSubImage = JSON.parse(raw_image);
    if (image.src === "" || image.src === "/")
      return required_res("image src");
    images.push(image);
  }

  const links_raw = formData.getAll('links') as string[];
  let links:ProjectSubLink[] = [];
  for (let raw_link of links_raw) {
    let link:ProjectSubLink = JSON.parse(raw_link);
    if (link.title === "")
      return required_res("link's title");
    if (link.link === "")
      return required_res("link's link field");
    links.push(link);
  }

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const progress = formData.get('progress') as ProjectProgress;
  const short_description = formData.get('short_description') as string;
  const nav_description = formData.get('nav_description') as string;
  const full_description = formData.get('full_description') as string;

  if (title == "")
    return required_res("title");

  if (slug == "")
    return required_res("slug");

  function check_image_exists(id:number) {
    for (let image of images) {
      if (image.id === id)
        return true;
    }
    return false;
  }

  for (let image of project.images) {
    if (!check_image_exists(image.id)) {
      // delete the old file
      const fullOldPath = path.join(process.cwd(), 'public', image.src);
      try {
          console.log(`Deleting old image file : ${fullOldPath}`);
          await unlink(fullOldPath);
      } catch (err) {
          console.warn(err);
      }
    }
  }
  
  console.log(`Attempting to upload ${image_files.length} images`)
  for (let file of image_files) {
    if (file !== null) {
      // save the new file
      const buffer = Buffer.from(await file.arrayBuffer());
      const destinationPath = path.join(process.cwd(), 'public', 'uploads', file.name);
      await writeFile(destinationPath, buffer);
    }
  }
  

  const imageIdsToKeep = images.map(img => img.id).filter(Boolean);
  const linkIdsToKeep = links.map(link => link.id).filter(Boolean);
  
  return NextResponse.json(
    await prisma.project.update({ where: { id }, data:{
        title,
        slug,
        progress,
        short_description,
        nav_description,
        full_description,
        images:{
          deleteMany: {
            id: { notIn: imageIdsToKeep }
          },
          upsert: images.map((image) => ({
            where: { id: image.id || -1 }, // If it's a new image, id will be undefined
            update: {
              title: image.title,
              description: image.description,
              src: image.src,
            },
            create: {
              title: image.title,
              description: image.description,
              src: image.src
            }
          }))
        },
        links:{
          deleteMany: {
            id: { notIn: linkIdsToKeep }
          },
          upsert: links.map((link) => ({
            where: { id: link.id || -1 }, // If it's a new image, id will be undefined
            update: {
              title: link.title,
              description: link.description,
              link: link.link,
            },
            create: {
              title: link.title,
              description: link.description,
              link: link.link,
            }
          }))
        }
    } })
  );
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  const project = await prisma.project.findFirst({
    where: {
      id
    },
    include: {
      contributions: {
          include: {
          contributor: true, // fetch the contributor for each contribution
          },
      },
      links: true,
      images: true,
      project_sub_pages: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: 'The requested project does not exist.' },
      { status: 404 }
    );
  }

  for (let image of project.images ? project.images : []) {
    const fullOldPath = path.join(process.cwd(), 'public', image.src);
    try {
        console.log(`Deleting old image file : ${fullOldPath}`);
        await unlink(fullOldPath);
    } catch (err) {
        console.warn(err);
    }
  }
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

