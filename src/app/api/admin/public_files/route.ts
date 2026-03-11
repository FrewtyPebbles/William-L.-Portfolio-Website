import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import path from "path"
import { writeFile, unlink } from 'fs/promises';
import OUTPUTS, { TerraformOutputs } from "@/lib/terraform_outputs";
import { s3_delete_file, s3_upload_file } from "@/lib/s3_api";
import { is_prod } from "@/lib/utils";


export async function GET() {
    return NextResponse.json(
        await prisma.publicFile.findMany({})
    )
}

export async function POST(req: Request) {
    console.log(`Attempting to create public file...`);

    const formData = await req.formData();


    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const tool_tip = formData.get('tool_tip') as string;
    const src = formData.get('src') as string;

    if (title == "") {
        console.warn("A title was not included with the public file, failing request.")
        return NextResponse.json(
            { error: 'A public file title must be supplied.' },
            { status: 400 }
        );
    }

    if (tool_tip == "") {
        console.warn("A tool tip was not included with the public file, failing request.")
        return NextResponse.json(
            { error: 'A public file tool tip must be supplied.' },
            { status: 400 }
        );
    }

    if (src == "") {
        console.warn("A src was not included with the public file, failing request.")
        return NextResponse.json(
            { error: 'A public file src must be supplied.' },
            { status: 400 }
        );
    }

    if (!file) {
        console.warn("A file was not included with the public file, failing request.")
        return NextResponse.json(
            { error: 'A public file file must be supplied.' },
            { status: 400 }
        );
    } else {
        const buffer = Buffer.from(await file.arrayBuffer());
        const relative_path = `public/uploads/${file.name}`;
        if (is_prod()) {
            console.log(`Writing public file file to s3 bucket at ${relative_path}`)
            await s3_upload_file(relative_path, buffer);
        } else {
            const destinationPath = path.join(process.cwd(), relative_path);
            console.log(`Writing public file file to ${destinationPath}`)
            await writeFile(destinationPath, buffer);
        }
    }

    return NextResponse.json(
        await prisma.publicFile.create({
            data: {
                title,
                tool_tip,
                src
            }
        })
    );
}

export async function PUT(req: Request) {
    console.log(`Attempting to update public file...`);

    const formData = await req.formData();

    const id = Number(formData.get('id'));

    console.log(`Searching for public file with id : ${id}`);

    const public_file = await prisma.publicFile.findUnique({
        select: { src: true },
        where: { id }
    });

    if (!public_file) {
        return NextResponse.json(
            { error: 'The requested public file does not exist.' },
            { status: 404 }
        );
    }

    console.log("Found public file");


    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const tool_tip = formData.get('tool_tip') as string;
    const src = formData.get('src') as string;

    if (file !== null) {
        // delete the old file
        const relative_old_path = `public/uploads/${public_file.src}`;
        if (is_prod()) {
            await s3_delete_file(relative_old_path);
        } else {
            const fullOldPath = path.join(process.cwd(), relative_old_path);
            try {
                await unlink(fullOldPath);
            } catch (err) {
                console.warn("Old file not found, skipping deletion");
            }
        }
        // save the new file
        const buffer = Buffer.from(await file.arrayBuffer());
        const relative_path = `public/uploads/${file.name}`;
        if (is_prod()) {
            // PROD
            await s3_upload_file(relative_path, buffer);
        } else {
            const destinationPath = path.join(process.cwd(), relative_path);
            // DEV
            await writeFile(destinationPath, buffer);
        }
    }

    return NextResponse.json(
        await prisma.publicFile.update({
            where: { id }, data: {
                title,
                tool_tip,
                src
            }
        })
    );
}

export async function DELETE(req: Request) {
    const { id } = await req.json()
    const public_file = await prisma.publicFile.findFirst({ where: { id } });
    if (!public_file) {
        return NextResponse.json(
            { error: 'The requested public file does not exist.' },
            { status: 404 }
        );
    }
    const relative_path = `public/uploads/${public_file.src}`;
    try {
        if (is_prod()) {
            await s3_delete_file(relative_path);
        } else {
            const fullOldPath = path.join(process.cwd(), relative_path);
            await unlink(fullOldPath);
        }
        await prisma.publicFile.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.warn("File not found, skipping deletion");
        return NextResponse.json(
            { error: 'File not found.' },
            { status: 404 }
        );
    }
}