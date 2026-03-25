import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import path from "path"
import { writeFile, unlink } from 'fs/promises';
import { Prisma, ProjectProgress, ProjectSubImage, ProjectSubLink } from "@/generated/prisma";
import { is_prod } from "@/lib/server-utils";
import { get_asset_s3_url, s3_delete_file, s3_upload_file } from "@/lib/s3_api";
import { get_asset_url } from "@/lib/utils";

type FullContribution = Prisma.ContributionGetPayload<{
    include: {
        level: true,
        description: true,
        contributor: {
            select: {
                name:true,
                githubUserName:true,
            }
        }
    },
}>;

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
  
  const image_files = formData.getAll('image_files') as (File | "null")[];

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

  const contributions_raw = formData.getAll('contributions') as string[];
  let contributions:FullContribution[] = [];
  for (let raw_contribution of contributions_raw) {
    let contribution:FullContribution = JSON.parse(raw_contribution);
    if (contribution.contributor.githubUserName === "")
      return required_res("contribution contributor's github name");
    if (contribution.contributor.name === "")
      return required_res("contribution contributor's name");
    if (!["EXTRA_SMALL", "SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE", "EVERYTHING", "NON_APPLICABLE"].includes(contribution.level as string))
      return required_res("contribution's level");
    contributions.push(contribution);
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
    if (file !== "null") {
      // save the new file
      const buffer = Buffer.from(await file.arrayBuffer());
      const relative_path = get_asset_url(file.name);
      if (is_prod()) {
        await s3_upload_file(get_asset_s3_url(file.name), buffer);
      } else {
        const destinationPath = path.join(process.cwd(), "public", relative_path);
        await writeFile(destinationPath, buffer);
      }
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
        },
        contributions:{
          create: contributions.map((contribution) => ({
            level: contribution.level,
            description: contribution.description,
            contributor: {
              connectOrCreate: {
                where: { githubUserName: contribution.contributor.githubUserName },
                create: {
                  name: contribution.contributor.name,
                  githubUserName: contribution.contributor.githubUserName,
                },
              },
            },
          })),
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
        

  const image_files = formData.getAll('image_files') as (File|"null")[];

  const images_raw = formData.getAll('images') as string[];
  let images:ProjectSubImage[] = [];
  for (let raw_image of images_raw) {
    let image:ProjectSubImage = JSON.parse(raw_image);
    if (image.src === "" || image.src === "/")
      return required_res("image src");
    images.push(image);
    console.log("IMAGE SENT TO SERVER ", image);
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

  const contributions_raw = formData.getAll('contributions') as string[];
  let contributions:FullContribution[] = [];
  for (let raw_contribution of contributions_raw) {
    let contribution:FullContribution = JSON.parse(raw_contribution);
    if (contribution.contributor.githubUserName === "")
      return required_res("contribution contributor's github name");
    if (contribution.contributor.name === "")
      return required_res("contribution contributor's name");
    if (!["EXTRA_SMALL", "SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE", "EVERYTHING", "NON_APPLICABLE"].includes(contribution.level as string))
      return required_res("contribution's level");
    contributions.push(contribution);
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
      const relative_old_path = get_asset_url(image.src);
      if (is_prod()) {
        await s3_delete_file(get_asset_s3_url(image.src))
      } else {
        const fullOldPath = path.join(process.cwd(), "public", relative_old_path);
        try {
            console.log(`Deleting old image file : ${fullOldPath}`);
            await unlink(fullOldPath);
        } catch (err) {
            console.warn(err);
        }
      }
    }
  }
  
  console.log(`Attempting to upload ${image_files.length} images`)
  for (let file of image_files) {
    if (file !== "null") {
      // save the new file
      const buffer = Buffer.from(await file.arrayBuffer());
      const relative_path = get_asset_url(file.name);
      if (is_prod()) {
        await s3_upload_file(get_asset_s3_url(file.name), buffer);
      } else {
        const destinationPath = path.join(process.cwd(), "public", relative_path);
        await writeFile(destinationPath, buffer);
      }
    }
  }
  

  const imageIdsToKeep = images.map(img => img.id).filter(Boolean);
  const linkIdsToKeep = links.map(link => link.id).filter(Boolean);
  const contributionIdsToKeep = contributions.map(contribution => contribution.id).filter(Boolean);
  
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
            where: { id: link.id || -1 }, // If it's a new link, id will be undefined
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
        },
        contributions: {
          deleteMany: {
            id: { notIn: contributionIdsToKeep }
          },
          upsert: contributions.map((contribution) => ({
            where: { id: contribution.id || -1 },
            update: {
              level: contribution.level,
              description: contribution.description,
              contributor: {
                upsert: {
                  where: { githubUserName: contribution.contributor.githubUserName },
                  update: { 
                    name: contribution.contributor.name 
                  },
                  create: {
                    name: contribution.contributor.name,
                    githubUserName: contribution.contributor.githubUserName,
                  },
                },
              },
            },
            create: {
              level: contribution.level,
              description: contribution.description,
              contributor: {
                connectOrCreate: {
                  where: { githubUserName: contribution.contributor.githubUserName },
                  create: {
                    name: contribution.contributor.name,
                    githubUserName: contribution.contributor.githubUserName,
                  },
                },
              },
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
    const relative_path = get_asset_url(image.src);
    if (is_prod()) {
      await s3_delete_file(get_asset_s3_url(image.src));
    } else {
      const fullOldPath = path.join(process.cwd(), "public", relative_path);
      try {
          console.log(`Deleting old image file : ${fullOldPath}`);
          await unlink(fullOldPath);
      } catch (err) {
          console.warn(err);
      }
    }
  }
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

