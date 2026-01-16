import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import path from "path"
import { writeFile, unlink } from 'fs/promises';

export async function GET() {
  return NextResponse.json(
    await prisma.resume.findMany({})
  )
}

export async function POST(req: Request) {
  console.log(`Attempting to create resume...`);
  
  const formData = await req.formData();
        

  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const nav_description = formData.get('nav_description') as string;
  const src = formData.get('src') as string;

  if (title == "") {
    console.warn("A title was not included with the resume, failing request.")
    return NextResponse.json(
        { error: 'A resume title must be supplied.' },
        { status: 400 }
    );
  }

  if (nav_description == "") {
    console.warn("A nav description was not included with the resume, failing request.")
    return NextResponse.json(
        { error: 'A resume nav description must be supplied.' },
        { status: 400 }
    );
  }

  if (src == "") {
    console.warn("A src was not included with the resume, failing request.")
    return NextResponse.json(
        { error: 'A resume src must be supplied.' },
        { status: 400 }
    );
  }

  if (!file) {
    console.warn("A file was not included with the resume, failing request.")
    return NextResponse.json(
        { error: 'A resume file must be supplied.' },
        { status: 400 }
    );
  } else {
    const buffer = Buffer.from(await file.arrayBuffer());
    const destinationPath = path.join(process.cwd(), 'public', file.name);
    console.log(`Writing resume file to ${destinationPath}`)
    await writeFile(destinationPath, buffer);
  }
  
  return NextResponse.json(
    await prisma.resume.create({ data:{
        title,
        nav_description,
        src
    } })
  );
}

export async function PUT(req: Request) {
  console.log(`Attempting to update resume...`);
  
  const formData = await req.formData();
  
  const id = Number(formData.get('id'));

  console.log(`Searching for resume with id : ${id}`);

  const resume = await prisma.resume.findUnique({
        select:{ src:true },
        where: { id }
    });

    if (!resume) {
        return NextResponse.json(
            { error: 'The requested resume does not exist.' },
            { status: 404 }
        );
    }

    console.log("Found Resume");
        

  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const nav_description = formData.get('nav_description') as string;
  const src = formData.get('src') as string;

  if (file !== null) {
    // delete the old file
    const fullOldPath = path.join(process.cwd(), 'public', resume.src);
    try {
        await unlink(fullOldPath);
    } catch (err) {
        console.warn("Old file not found, skipping deletion");
    }
    // save the new file
    const buffer = Buffer.from(await file.arrayBuffer());
    const destinationPath = path.join(process.cwd(), 'public', file.name);
    await writeFile(destinationPath, buffer);
  }
  
  return NextResponse.json(
    await prisma.resume.update({ where: { id }, data:{
        title,
        nav_description,
        src
    } })
  );
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.resume.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}